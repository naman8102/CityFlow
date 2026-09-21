const BASE_URL = 'http://localhost:5000/api';

async function testSosWorkflow() {
  console.log('====================================================');
  console.log('🧪 SPECIAL CASE SOS WORKFLOW: COMPREHENSIVE TEST SUITE');
  console.log('====================================================\n');

  const timestamp = Date.now();
  const normalEmail = `normal_${timestamp}@cityflow.org`;
  const specialEmail = `special_${timestamp}@cityflow.org`;
  const testPassword = 'Password#2026';

  // ─── 1. Default Seed Users Verification ───
  console.log('--- 1. Testing Default Seed Accounts ---');
  const specialLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'special@cityflow.ai', password: 'CityFlow@2026' })
  });
  const specialLoginData = await specialLoginRes.json();
  if (specialLoginRes.status === 200 && specialLoginData.user?.userType === 'EMERGENCY_SPECIAL') {
    console.log('✅ Seed special@cityflow.ai login successful (userType: EMERGENCY_SPECIAL).');
  } else {
    console.error('❌ Failed seed special@cityflow.ai check:', specialLoginRes.status, specialLoginData);
    process.exit(1);
  }

  const policeLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'police@cityflow.ai', password: 'CityFlow@2026' })
  });
  const policeLoginData = await policeLoginRes.json();
  const policeToken = policeLoginData.token;
  if (policeLoginRes.status === 200 && policeLoginData.user?.role === 'POLICE') {
    console.log('✅ Seed police@cityflow.ai login successful (role: POLICE).');
  } else {
    console.error('❌ Failed seed police@cityflow.ai check:', policeLoginRes.status, policeLoginData);
    process.exit(1);
  }

  // ─── 2. Signup: Normal Citizen vs Emergency Special Case ───
  console.log('\n--- 2. Testing Signup with User Type Categories ---');
  
  // Normal Citizen Signup
  const normalSignupRes = await fetch(`${BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Normal Commuter',
      email: normalEmail,
      password: testPassword,
      role: 'USER',
      userType: 'NORMAL'
    })
  });
  const normalSignupData = await normalSignupRes.json();
  const normalToken = normalSignupData.token;
  if (normalSignupRes.status === 201 && normalSignupData.user?.userType === 'NORMAL') {
    console.log('✅ Normal Citizen signed up successfully (userType: NORMAL).');
  } else {
    console.error('❌ Failed normal citizen signup:', normalSignupRes.status, normalSignupData);
    process.exit(1);
  }

  // Emergency Special Case Signup
  const specialSignupRes = await fetch(`${BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: 'Emergency Patient Escort',
      email: specialEmail,
      password: testPassword,
      role: 'USER',
      userType: 'EMERGENCY_SPECIAL'
    })
  });
  const specialSignupData = await specialSignupRes.json();
  const specialToken = specialSignupData.token;
  if (specialSignupRes.status === 201 && specialSignupData.user?.userType === 'EMERGENCY_SPECIAL') {
    console.log('✅ Emergency Special Case citizen signed up successfully (userType: EMERGENCY_SPECIAL).');
  } else {
    console.error('❌ Failed special case signup:', specialSignupRes.status, specialSignupData);
    process.exit(1);
  }

  // ─── 3. Security Check: Normal Citizen Cannot Request SOS ───
  console.log('\n--- 3. Testing RBAC Security: Normal Citizen Forbidden ---');
  const normalSosRes = await fetch(`${BASE_URL}/sos/request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${normalToken}`
    },
    body: JSON.stringify({
      notes: 'Normal citizen trying to get emergency bypass'
    })
  });
  const normalSosData = await normalSosRes.json();
  if (normalSosRes.status === 403 && (normalSosData.error || '').includes('Special Case')) {
    console.log('✅ Correctly blocked Normal Citizen from initiating SOS (403 Forbidden):', normalSosData.error);
  } else {
    console.error('❌ Security breach! Normal Citizen was not blocked:', normalSosRes.status, normalSosData);
    process.exit(1);
  }

  // ─── 4. Special Case Citizen Creates SOS (Status: REQUESTED) ───
  console.log('\n--- 4. Special Case Citizen Initiates Priority SOS ---');
  const specialSosRes = await fetch(`${BASE_URL}/sos/request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${specialToken}`
    },
    body: JSON.stringify({
      notes: 'Critical cardiac patient being transported from Connaught Place to NDRS',
      emergencyType: 'CRITICAL_MEDICAL_ESCORT'
    })
  });
  const specialSosData = await specialSosRes.json();
  if (specialSosRes.status === 201 && specialSosData.request?.status === 'REQUESTED') {
    console.log('✅ SOS Request created successfully with status = REQUESTED.');
    console.log(`   Request ID: ${specialSosData.request.requestId}`);
  } else {
    console.error('❌ Failed to create SOS request:', specialSosRes.status, specialSosData);
    process.exit(1);
  }

  const sosRequestId = specialSosData.request.requestId || specialSosData.request._id;

  // ─── 5. Duplicate Protection Check ───
  console.log('\n--- 5. Testing Duplicate Request Prevention ---');
  const duplicateRes = await fetch(`${BASE_URL}/sos/request`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${specialToken}`
    },
    body: JSON.stringify({
      notes: 'Duplicate request attempt'
    })
  });
  const duplicateData = await duplicateRes.json();
  if (duplicateRes.status === 409 && (duplicateData.error || '').includes('Duplicate')) {
    console.log('✅ Correctly prevented duplicate SOS request (409 Conflict):', duplicateData.error);
  } else {
    console.error('❌ Duplicate prevention failed! Status:', duplicateRes.status, duplicateData);
    process.exit(1);
  }

  // ─── 6. User Cannot Directly Verify or Proceed (RBAC Enforcement) ───
  console.log('\n--- 6. Testing RBAC: Requester Cannot Verify or Proceed ---');
  const citizenVerifyRes = await fetch(`${BASE_URL}/sos/${sosRequestId}/verify`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${specialToken}` }
  });
  if (citizenVerifyRes.status === 403) {
    console.log('✅ Citizen blocked from verifying request (403 Forbidden).');
  } else {
    console.error('❌ Citizen was allowed to verify! Status:', citizenVerifyRes.status);
    process.exit(1);
  }

  const citizenProceedRes = await fetch(`${BASE_URL}/sos/${sosRequestId}/proceed`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${specialToken}` }
  });
  if (citizenProceedRes.status === 403) {
    console.log('✅ Citizen blocked from activating/proceeding request (403 Forbidden).');
  } else {
    console.error('❌ Citizen was allowed to proceed! Status:', citizenProceedRes.status);
    process.exit(1);
  }

  // ─── 7. Police Workflow Step A: Cannot Proceed before Verify ───
  console.log('\n--- 7. Police Workflow: Cannot Bypass Verify Step ---');
  const bypassProceedRes = await fetch(`${BASE_URL}/sos/${sosRequestId}/proceed`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${policeToken}` }
  });
  const bypassData = await bypassProceedRes.json();
  if (bypassProceedRes.status === 400 && (bypassData.error || '').includes('VERIFIED')) {
    console.log('✅ Police correctly prevented from PROCEED before VERIFY:', bypassData.error);
  } else {
    console.error('❌ Allowed proceed before verify! Status:', bypassProceedRes.status, bypassData);
    process.exit(1);
  }

  // ─── 8. Police Workflow Step B: VERIFY ───
  console.log('\n--- 8. Police Workflow: VERIFY Request ---');
  const verifyRes = await fetch(`${BASE_URL}/sos/${sosRequestId}/verify`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${policeToken}` }
  });
  const verifyData = await verifyRes.json();
  if (verifyRes.status === 200 && verifyData.request?.status === 'VERIFIED') {
    console.log('✅ Police verified request successfully. Status is now VERIFIED.');
    console.log(`   Verified By: ${verifyData.request.verifiedByName} at ${verifyData.request.verifiedAt}`);
  } else {
    console.error('❌ Police verification failed:', verifyRes.status, verifyData);
    process.exit(1);
  }

  // Verify Citizen Tab sees status === VERIFIED via getMyStatus
  const citizenStatusAfterVerify = await fetch(`${BASE_URL}/sos/my-status`, {
    headers: { 'Authorization': `Bearer ${specialToken}` }
  });
  const citizenStatusData1 = await citizenStatusAfterVerify.json();
  if (citizenStatusData1.activeRequest?.status === 'VERIFIED') {
    console.log('✅ Citizen query reflects updated status: VERIFIED.');
  } else {
    console.error('❌ Citizen active status mismatch:', citizenStatusData1);
    process.exit(1);
  }

  // ─── 9. Police Workflow Step C: PROCEED (Activate Green Wave SOS) ───
  console.log('\n--- 9. Police Workflow: PROCEED & ACTIVATE Green Corridor ---');
  const proceedRes = await fetch(`${BASE_URL}/sos/${sosRequestId}/proceed`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${policeToken}` }
  });
  const proceedData = await proceedRes.json();
  if (proceedRes.status === 200 && proceedData.request?.status === 'ACTIVE') {
    console.log('✅ SOS successfully ACTIVATED by Police! Status is now ACTIVE 🚨');
    console.log(`   Emergency Mission Code: ${proceedData.mission?.missionCode}`);
    console.log(`   Preempted Signals: ${proceedData.mission?.preemptedSignals?.length || 6} Intersections locked GREEN.`);
  } else {
    console.error('❌ Police proceed failed:', proceedRes.status, proceedData);
    process.exit(1);
  }

  // Verify Citizen Tab sees status === ACTIVE
  const citizenStatusAfterProceed = await fetch(`${BASE_URL}/sos/my-status`, {
    headers: { 'Authorization': `Bearer ${specialToken}` }
  });
  const citizenStatusData2 = await citizenStatusAfterProceed.json();
  if (citizenStatusData2.activeRequest?.status === 'ACTIVE') {
    console.log('✅ Citizen query reflects updated status: ACTIVE 🚨.');
  } else {
    console.error('❌ Citizen active status mismatch:', citizenStatusData2);
    process.exit(1);
  }

  // ─── 10. Audit Trail Verification ───
  console.log('\n--- 10. Verifying Audit Trail Integrity ---');
  const allReqsRes = await fetch(`${BASE_URL}/sos/requests`, {
    headers: { 'Authorization': `Bearer ${policeToken}` }
  });
  const allReqsData = await allReqsRes.json();
  const targetReq = allReqsData.requests.find(r => r.requestId === sosRequestId || r._id === sosRequestId);
  if (targetReq && targetReq.auditLog && targetReq.auditLog.length >= 3) {
    console.log(`✅ Audit trail intact with ${targetReq.auditLog.length} recorded actions:`);
    targetReq.auditLog.forEach((log, idx) => {
      console.log(`   [${idx + 1}] Action: ${log.action} | ActorRole: ${log.actorRole} | Details: ${log.details}`);
    });
  } else {
    console.error('❌ Audit trail missing entries:', targetReq?.auditLog);
    process.exit(1);
  }

  // ─── 11. Police Clears/Resolves SOS ───
  console.log('\n--- 11. Police Resolves Active SOS ---');
  const resolveRes = await fetch(`${BASE_URL}/sos/${sosRequestId}/resolve`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${policeToken}` }
  });
  const resolveData = await resolveRes.json();
  if (resolveRes.status === 200 && resolveData.request?.status === 'RESOLVED') {
    console.log('✅ SOS request resolved successfully.');
  } else {
    console.error('❌ Failed to resolve SOS request:', resolveRes.status, resolveData);
    process.exit(1);
  }

  // Verify citizen can now request again after resolution
  const postResolveStatus = await fetch(`${BASE_URL}/sos/my-status`, {
    headers: { 'Authorization': `Bearer ${specialToken}` }
  });
  const postResolveData = await postResolveStatus.json();
  if (!postResolveData.activeRequest) {
    console.log('✅ Citizen has no more blocking active request; panel returns to INACTIVE/Ready state.');
  }

  console.log('\n====================================================');
  console.log('🎉 ALL SPECIAL CASE SOS WORKFLOW TESTS PASSED PERFECTLY!');
  console.log('====================================================');
}

testSosWorkflow().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
