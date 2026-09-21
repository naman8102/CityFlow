import http from 'http';

const BASE_URL = 'http://localhost:5000';

function makeRequest({ method, path, data = null, token = null }) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const postData = data ? JSON.stringify(data) : null;
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    if (postData) {
      headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = http.request(url, { method, headers }, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

async function runTests() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  CITYFLOW — VIP SOS WORKFLOW & PERMISSION AUTOMATED TEST SUITE');
  console.log('═══════════════════════════════════════════════════════════════\n');

  let passedCount = 0;
  let totalCount = 0;

  function assert(testName, condition, details = '') {
    totalCount++;
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`);
      passedCount++;
    } else {
      console.error(`  ❌ [FAIL] ${testName} ${details ? `— ${details}` : ''}`);
    }
  }

  try {
    // 1. Authenticate Personas
    console.log('--- Step 1: Persona Logins ---');
    const citizenRes = await makeRequest({
      method: 'POST',
      path: '/api/auth/login',
      data: { email: 'citizen@cityflow.ai', password: 'CityFlow@2026' }
    });
    assert('Normal Citizen login succeeds', citizenRes.status === 200 && citizenRes.data?.token);
    const citizenToken = citizenRes.data?.token;

    const vipRes = await makeRequest({
      method: 'POST',
      path: '/api/auth/login',
      data: { email: 'vip@cityflow.ai', password: 'CityFlow@2026' }
    });
    assert('VIP User login succeeds', vipRes.status === 200 && vipRes.data?.token && vipRes.data?.user?.userType === 'VIP');
    const vipToken = vipRes.data?.token;

    const policeRes = await makeRequest({
      method: 'POST',
      path: '/api/auth/login',
      data: { email: 'police@cityflow.ai', password: 'CityFlow@2026' }
    });
    assert('Police Officer login succeeds', policeRes.status === 200 && policeRes.data?.token && policeRes.data?.user?.role === 'POLICE');
    const policeToken = policeRes.data?.token;

    const logisticsRes = await makeRequest({
      method: 'POST',
      path: '/api/auth/login',
      data: { email: 'logistics@cityflow.ai', password: 'CityFlow@2026' }
    });
    assert('Logistics User login succeeds', logisticsRes.status === 200 && logisticsRes.data?.token);
    const logisticsToken = logisticsRes.data?.token;

    // Cleanup: Resolve any pre-existing active VIP SOS requests from previous test runs
    const vipStatusRes = await makeRequest({
      method: 'GET',
      path: '/api/sos/my-status',
      token: vipToken
    });
    if (vipStatusRes.data?.activeRequest) {
      const activeId = vipStatusRes.data.activeRequest._id || vipStatusRes.data.activeRequest.id;
      await makeRequest({
        method: 'POST',
        path: `/api/sos/${activeId}/resolve`,
        token: policeToken,
        data: { resolutionNotes: 'Pre-test suite cleanup' }
      });
    }

    // 2. Normal Citizen cannot request VIP SOS (or non-special cannot request priority SOS)
    console.log('\n--- Step 2: Normal Citizen Restricted from Requesting SOS ---');
    const citizenRequestRes = await makeRequest({
      method: 'POST',
      path: '/api/sos/request',
      token: citizenToken,
      data: {
        origin: { lat: 28.6139, lng: 77.2090, address: 'India Gate' },
        sosType: 'VIP'
      }
    });
    assert(
      'Normal Citizen blocked from creating SOS request (HTTP 403)',
      citizenRequestRes.status === 403,
      `Received status ${citizenRequestRes.status}`
    );

    // 3. VIP User creates VIP SOS Request
    console.log('\n--- Step 3: VIP User Requests VIP SOS ---');
    const vipDestination = {
      lat: 28.6144,
      lng: 77.1996,
      name: 'Rashtrapati Bhavan (State Protocol Wing)',
      address: 'Presidential Estate, New Delhi'
    };
    const vipCreateRes = await makeRequest({
      method: 'POST',
      path: '/api/sos/request',
      token: vipToken,
      data: {
        origin: { lat: 28.5562, lng: 77.1000, address: 'Indira Gandhi International Airport (Terminal 3)' },
        destination: vipDestination,
        sosType: 'VIP',
        priorityReason: 'High-Level Foreign Dignitary Escort Protocol'
      }
    });
    assert(
      'VIP User successfully creates VIP SOS request (HTTP 201)',
      vipCreateRes.status === 201 && vipCreateRes.data?.success,
      JSON.stringify(vipCreateRes.data)
    );
    const vipSos = vipCreateRes.data?.request;
    assert('Created request has sosType === "VIP"', vipSos?.sosType === 'VIP');
    assert('Created request has status === "REQUESTED"', vipSos?.status === 'REQUESTED');
    assert('Created request has routeType === "VIP_PRIORITY_ROUTE"', vipSos?.routeType === 'VIP_PRIORITY_ROUTE');
    assert('Pre-calculated VIP route has risk score & security safety index', vipSos?.routeDetails?.riskScore !== undefined && vipSos?.routeDetails?.safetyIndex > 0);
    const vipRequestId = vipSos?._id || vipSos?.id;

    // 4. Non-Police Users Blocked from Activating VIP SOS
    console.log('\n--- Step 4: Verification of Activation Permission (Police ONLY) ---');
    // VIP user tries to activate directly
    const vipSelfActivateRes = await makeRequest({
      method: 'POST',
      path: `/api/sos/${vipRequestId}/activate-vip`,
      token: vipToken,
      data: {}
    });
    assert(
      'VIP User blocked from activating VIP SOS directly (HTTP 403)',
      vipSelfActivateRes.status === 403,
      `Received status ${vipSelfActivateRes.status}`
    );

    // Logistics user tries to activate
    const logisticsActivateRes = await makeRequest({
      method: 'POST',
      path: `/api/sos/${vipRequestId}/activate-vip`,
      token: logisticsToken,
      data: {}
    });
    assert(
      'Logistics User blocked from activating VIP SOS (HTTP 403)',
      logisticsActivateRes.status === 403,
      `Received status ${logisticsActivateRes.status}`
    );

    // 5. Police Verifies VIP SOS Request
    console.log('\n--- Step 5: Police Verification of VIP SOS ---');
    const verifyRes = await makeRequest({
      method: 'POST',
      path: `/api/sos/${vipRequestId}/verify`,
      token: policeToken,
      data: { notes: 'VIP identity and state itinerary verified by Delhi Police Traffic HQ' }
    });
    assert(
      'Police Officer verifies VIP SOS (HTTP 200, status === "VERIFIED")',
      verifyRes.status === 200 && verifyRes.data?.request?.status === 'VERIFIED'
    );

    // 6. Police Activates VIP SOS
    console.log('\n--- Step 6: Police Activates VIP SOS Corridor ---');
    const activateRes = await makeRequest({
      method: 'POST',
      path: `/api/sos/${vipRequestId}/activate-vip`,
      token: policeToken,
      data: { clearDurationMinutes: 25 }
    });
    assert(
      'Police Officer successfully activates VIP SOS (HTTP 200)',
      activateRes.status === 200 && activateRes.data?.success
    );
    const activatedSos = activateRes.data?.request;
    assert('Activated SOS has status === "ACTIVE"', activatedSos?.status === 'ACTIVE');
    assert('Activated SOS has routeType === "VIP_PRIORITY_ROUTE"', activatedSos?.routeType === 'VIP_PRIORITY_ROUTE');
    assert('Corridor path coordinates generated', Array.isArray(activatedSos?.corridorPath) && activatedSos.corridorPath.length > 2);
    const vipCorridorCoords = activatedSos?.corridorPath || activateRes.data?.vipData?.corridorPath || activateRes.data?.vipRoute?.coordinates || [];
    assert('Corridor path coordinates generated', Array.isArray(vipCorridorCoords) && vipCorridorCoords.length > 2);

    // 7. Verify Separation of Route vs Emergency Green Corridor
    console.log('\n--- Step 7: Route Isolation Test (VIP vs Emergency Corridor) ---');
    // Request normal emergency corridor
    const emergencyDispatchRes = await makeRequest({
      method: 'POST',
      path: '/api/emergency/dispatch',
      token: policeToken,
      data: {
        vehicleType: 'AMBULANCE',
        vehicleNumber: 'DL-01-EQ-8812',
        originQuery: 'ram-manohar-lohia-hospital',
        destQuery: 'new-delhi-railway-station'
      }
    });
    assert(
      'Emergency SOS dispatch generates independent corridor path',
      (emergencyDispatchRes.status === 200 || emergencyDispatchRes.status === 201) && Array.isArray(emergencyDispatchRes.data?.corridorPath)
    );
    const emergencyCorridorCoords = emergencyDispatchRes.data?.corridorPath || [];

    // Compare VIP corridor with Emergency corridor
    const vipCoordStr = JSON.stringify(vipCorridorCoords);
    const emergCoordStr = JSON.stringify(emergencyCorridorCoords);
    assert(
      'VIP Priority Route coordinates are distinct from Emergency Green Corridor (NOT identical)',
      vipCoordStr !== emergCoordStr && vipCorridorCoords.length > 0 && emergencyCorridorCoords.length > 0,
      `VIP Length: ${vipCorridorCoords.length}, Emergency Length: ${emergencyCorridorCoords.length}`
    );

    // 8. Police Resolves VIP SOS
    console.log('\n--- Step 8: Police Resolves VIP SOS ---');
    const resolveRes = await makeRequest({
      method: 'POST',
      path: `/api/sos/${vipRequestId}/resolve`,
      token: policeToken,
      data: { resolutionNotes: 'VIP Convoy arrived safely at Rashtrapati Bhavan' }
    });
    assert(
      'Police resolves VIP SOS request (HTTP 200, status === "RESOLVED")',
      resolveRes.status === 200 && resolveRes.data?.request?.status === 'RESOLVED'
    );

    // 9. Clean up emergency mission
    const missionId = emergencyDispatchRes.data?.mission?._id || 'latest';
    await makeRequest({
      method: 'POST',
      path: `/api/emergency/clear/${missionId}`,
      token: policeToken,
      data: {}
    });

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log(`  TEST RESULTS: ${passedCount} / ${totalCount} PASSED`);
    if (passedCount === totalCount) {
      console.log('  🎉 ALL VIP SOS TESTS PASSED PERFECTLY!');
    } else {
      console.log('  ⚠️ SOME TESTS FAILED');
    }
    console.log('═══════════════════════════════════════════════════════════════\n');
  } catch (err) {
    console.error('Test execution failed with exception:', err);
  }
}

runTests();
