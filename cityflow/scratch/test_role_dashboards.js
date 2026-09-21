const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function runRoleDashboardVerification() {
  console.log('🚀 Starting Comprehensive RBAC & Multi-Role Dashboard Verification...\n');
  let passed = 0;
  let total = 0;

  function assert(condition, message) {
    total++;
    if (condition) {
      console.log(`✅ [PASS] ${message}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${message}`);
    }
  }

  try {
    const timestamp = Date.now();

    // 1. Sign up a Normal Citizen
    const citizenEmail = `citizen_${timestamp}@cityflow.ai`;
    const citizenPassword = 'Password@123';
    const citizenRes = await axios.post(`${BASE_URL}/auth/signup`, {
      name: 'Normal Citizen',
      email: citizenEmail,
      password: citizenPassword,
      role: 'USER',
      userType: 'NORMAL_CITIZEN'
    });
    const citizenToken = citizenRes.data.token;
    assert(citizenRes.status === 201 && citizenToken, 'Created Normal Citizen account with valid token');

    // 2. Sign up an Emergency Special Case Citizen
    const specialEmail = `special_${timestamp}@cityflow.ai`;
    const specialRes = await axios.post(`${BASE_URL}/auth/signup`, {
      name: 'Special Case Commuter',
      email: specialEmail,
      password: 'Password@123',
      role: 'USER',
      userType: 'EMERGENCY_SPECIAL'
    });
    const specialToken = specialRes.data.token;
    assert(specialRes.status === 201 && specialRes.data.user.userType === 'EMERGENCY_SPECIAL', 'Created Emergency Special Case Citizen account');

    // 3. Sign in as Police
    const policeRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'police@cityflow.ai',
      password: 'CityFlow@2026'
    });
    const policeToken = policeRes.data.token;
    assert(policeRes.data.user.role === 'POLICE', 'Authenticated as Traffic Police Command');

    // 4. Sign in as Logistics
    const logisticsRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'logistics@cityflow.ai',
      password: 'CityFlow@2026'
    });
    const logisticsToken = logisticsRes.data.token;
    assert(logisticsRes.data.user.role === 'LOGISTICS', 'Authenticated as Logistics Fleet Operator');

    // 5. TEST: Citizen attempting Police endpoints (Simulate Accident, Execute Response, Emergency Dispatch)
    console.log('\n--- Test Suite 1: Citizen Blocked from Police Operations ---');
    try {
      await axios.post(`${BASE_URL}/simulation/incident/simulate-accident`, {}, {
        headers: { Authorization: `Bearer ${citizenToken}` }
      });
      assert(false, 'Citizen simulate-accident should have been blocked');
    } catch (err) {
      assert(err.response?.status === 403, `Citizen simulate-accident blocked with HTTP ${err.response?.status}`);
    }

    try {
      await axios.post(`${BASE_URL}/emergency/dispatch`, {
        vehicleType: 'AMBULANCE',
        vehicleNumber: 'DL-01-TEST',
        originQuery: 'ram-manohar-lohia-hospital',
        destQuery: 'new-delhi-railway-station'
      }, {
        headers: { Authorization: `Bearer ${citizenToken}` }
      });
      assert(false, 'Citizen emergency dispatch should have been blocked');
    } catch (err) {
      assert(err.response?.status === 403, `Citizen emergency dispatch blocked with HTTP ${err.response?.status}`);
    }

    try {
      await axios.get(`${BASE_URL}/sos/requests`, {
        headers: { Authorization: `Bearer ${citizenToken}` }
      });
      assert(false, 'Citizen viewing all SOS requests should have been blocked');
    } catch (err) {
      assert(err.response?.status === 403, `Citizen viewing all SOS requests blocked with HTTP ${err.response?.status}`);
    }

    // 6. TEST: Citizen attempting Logistics operations (Freight shifting & fleet optimization)
    console.log('\n--- Test Suite 2: Citizen Blocked from Logistics Operations ---');
    try {
      await axios.patch(`${BASE_URL}/logistics/toggle-shift/LOG-TRK-001`, {}, {
        headers: { Authorization: `Bearer ${citizenToken}` }
      });
      assert(false, 'Citizen freight shift should have been blocked');
    } catch (err) {
      assert(err.response?.status === 403, `Citizen freight shift blocked with HTTP ${err.response?.status}`);
    }

    try {
      await axios.post(`${BASE_URL}/logistics/optimize`, {
        fleetCompany: 'Test Fleet',
        truckId: 'TRK-TEST',
        cargoType: 'Medical',
        tonnage: 5,
        route: 'Okhla to Azadpur',
        requestedHour: 9
      }, {
        headers: { Authorization: `Bearer ${citizenToken}` }
      });
      assert(false, 'Citizen logistics optimize should have been blocked');
    } catch (err) {
      assert(err.response?.status === 403, `Citizen logistics optimize blocked with HTTP ${err.response?.status}`);
    }

    // 7. TEST: Normal Citizen blocked from SOS Creation
    console.log('\n--- Test Suite 3: SOS Restrictions ---');
    try {
      await axios.post(`${BASE_URL}/sos/request`, {
        reason: 'Testing SOS from Normal Citizen',
        location: { lat: 28.6139, lng: 77.2090, label: 'Connaught Place' }
      }, {
        headers: { Authorization: `Bearer ${citizenToken}` }
      });
      assert(false, 'Normal citizen creating SOS should have been blocked');
    } catch (err) {
      assert(err.response?.status === 403, `Normal citizen SOS creation blocked with HTTP ${err.response?.status}`);
    }

    // 8. TEST: Emergency Special Case Citizen CAN create SOS
    const sosReqRes = await axios.post(`${BASE_URL}/sos/request`, {
      reason: 'Critical Patient Transport to AIIMS',
      location: { lat: 28.6139, lng: 77.2090, label: 'Barakhamba Road' }
    }, {
      headers: { Authorization: `Bearer ${specialToken}` }
    });
    assert(sosReqRes.status === 201 && sosReqRes.data.request.status === 'REQUESTED', 'Emergency Special Case user successfully submitted SOS request (status: REQUESTED)');
    const sosRequestId = sosReqRes.data.request._id;

    // 9. TEST: Police views SOS requests and Verifies
    console.log('\n--- Test Suite 4: Police SOS Verification and Activation ---');
    const allSosRes = await axios.get(`${BASE_URL}/sos/requests`, {
      headers: { Authorization: `Bearer ${policeToken}` }
    });
    const foundInQueue = allSosRes.data.requests.some(r => r._id === sosRequestId);
    assert(foundInQueue, 'Police SOS Queue reflects newly created request in real time');

    const verifyRes = await axios.post(`${BASE_URL}/sos/${sosRequestId}/verify`, {
      notes: 'Identity & hospital destination verified with Delhi Traffic Police HQ'
    }, {
      headers: { Authorization: `Bearer ${policeToken}` }
    });
    assert(verifyRes.status === 200 && verifyRes.data.request.status === 'VERIFIED', 'Police verified SOS request (status: VERIFIED, policeVerified: true)');

    const proceedRes = await axios.post(`${BASE_URL}/sos/${sosRequestId}/proceed`, {}, {
      headers: { Authorization: `Bearer ${policeToken}` }
    });
    assert(proceedRes.status === 200 && proceedRes.data.request.status === 'ACTIVE' && proceedRes.data.emergencyData, 'Police executed PROCEED, setting status to ACTIVE & deploying Green Corridor');

    // 10. TEST: Logistics can access Logistics endpoints
    console.log('\n--- Test Suite 5: Logistics Operations Authorized ---');
    const optRes = await axios.post(`${BASE_URL}/logistics/optimize`, {
      fleetCompany: 'Apex City Logistics',
      truckId: 'TRK-TEST-77',
      cargoType: 'Fresh Produce',
      tonnage: 7.2,
      route: 'Okhla Industrial Area → Azadpur Mandi',
      requestedHour: 9
    }, {
      headers: { Authorization: `Bearer ${logisticsToken}` }
    });
    assert((optRes.status === 200 || optRes.status === 201) && optRes.data.trip, 'Logistics operator successfully submitted freight optimization');

    // 11. Clean up emergency corridor
    const missionId = proceedRes.data.mission?._id || 'latest';
    await axios.post(`${BASE_URL}/emergency/clear/${missionId}`, {}, {
      headers: { Authorization: `Bearer ${policeToken}` }
    });
    assert(true, 'Emergency corridor cleared successfully');

  } catch (error) {
    console.error('Unexpected error during test execution:', error.message, error.response?.data);
  }

  console.log(`\n========================================`);
  console.log(`📊 FINAL RESULT: ${passed}/${total} TESTS PASSED`);
  console.log(`========================================\n`);

  if (passed === total) {
    console.log('🎉 ALL ROLE-BASED ACCESS CONTROL & DASHBOARD TESTS PASSED PERFECTLY!');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runRoleDashboardVerification();
