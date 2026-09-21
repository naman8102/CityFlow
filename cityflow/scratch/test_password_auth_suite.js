import { validatePasswordPolicy, evaluatePasswordStrength } from '../backend/utils/passwordPolicy.js';

const BASE_URL = 'http://localhost:5000/api';

async function runTests() {
  console.log('====================================================');
  console.log('1. UNIT TESTS: passwordPolicy.js');
  console.log('====================================================');

  const policyTests = [
    { pwd: 'Short1!', expectedPass: false, reason: 'Length < 8' },
    { pwd: 'ThisPasswordIsWayTooLong123@!', expectedPass: false, reason: 'Length > 15' },
    { pwd: 'nouppercase123@', expectedPass: false, reason: 'No uppercase' },
    { pwd: 'NOLOWERCASE123@', expectedPass: false, reason: 'No lowercase' },
    { pwd: 'NoNumbersHere!@', expectedPass: false, reason: 'No number' },
    { pwd: 'NoSpecial12345', expectedPass: false, reason: 'No special char' },
    { pwd: 'Has Space@123', expectedPass: false, reason: 'Contains spaces' },
    { pwd: 'CityFlow@2026', expectedPass: true, reason: 'Standard Seed Password' },
    { pwd: 'Ultra#Safe99', expectedPass: true, reason: 'Compliant password' },
    { pwd: 'Z!9xQ@7mK$2', expectedPass: true, reason: 'Very Strong password' }
  ];

  let unitFailures = 0;
  for (const t of policyTests) {
    let isValid = true;
    let errMsg = '';
    try {
      validatePasswordPolicy(t.pwd);
    } catch (e) {
      isValid = false;
      errMsg = e.message;
    }

    const passed = isValid === t.expectedPass;
    const strength = evaluatePasswordStrength(t.pwd);
    if (!passed) {
      console.error(`❌ FAILED: "${t.pwd}" (${t.reason}). Expected isValid=${t.expectedPass}, got ${isValid}. Error: ${errMsg}`);
      unitFailures++;
    } else {
      console.log(`✅ PASSED: "${t.pwd}" (${t.reason}) -> isValid=${isValid}, Strength=${strength.strength} (${strength.validCount}/6)`);
    }
  }

  if (unitFailures > 0) {
    throw new Error(`Unit tests failed with ${unitFailures} errors`);
  }

  console.log('\n====================================================');
  console.log('2. API INTEGRATION TESTS: Backend Auth Endpoints');
  console.log('====================================================');

  const testEmail = `sec_test_${Date.now()}@cityflow.org`;
  const initialPassword = 'Initial#Pass1';
  const updatedPassword = 'Updated#Pass2';
  const resetPassword = 'Final#Reset99';

  // Test 2.1: Signup with Weak Password (should fail HTTP 400)
  console.log('\n--- 2.1 Testing Signup with Weak Password ---');
  const weakSignupRes = await fetch(`${BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: 'weak',
      name: 'Security Tester'
    })
  });
  const weakSignupData = await weakSignupRes.json();
  const signupErrMsg = weakSignupData.error || weakSignupData.message || '';
  if (weakSignupRes.status === 400 && signupErrMsg.includes('Password')) {
    console.log('✅ Correctly rejected weak signup password (400):', signupErrMsg);
  } else {
    console.error('❌ Failed to reject weak signup password:', weakSignupRes.status, weakSignupData);
    process.exit(1);
  }

  // Test 2.2: Signup with Compliant Password
  console.log('\n--- 2.2 Testing Signup with Compliant Password ---');
  const goodSignupRes = await fetch(`${BASE_URL}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      password: initialPassword,
      name: 'Security Officer'
    })
  });
  const goodSignupData = await goodSignupRes.json();
  if (goodSignupRes.status === 201 && goodSignupData.token) {
    console.log('✅ Signup successful with token generated.');
    if (goodSignupData.user.password || goodSignupData.user.passwordHash || goodSignupData.user.salt) {
      console.error('❌ Plaintext password or hash leaked in signup response!');
      process.exit(1);
    } else {
      console.log('✅ No sensitive password fields leaked in signup response.');
    }
  } else {
    console.error('❌ Failed compliant signup:', goodSignupRes.status, goodSignupData);
    process.exit(1);
  }

  const userToken = goodSignupData.token;

  // Test 2.3: Change Password - Reject Invalid / Same Passwords
  console.log('\n--- 2.3 Testing Change Password Validations ---');
  
  // 2.3.a: Missing / bad current password
  const badCurrentRes = await fetch(`${BASE_URL}/auth/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`
    },
    body: JSON.stringify({
      currentPassword: 'WrongPassword#1',
      newPassword: updatedPassword
    })
  });
  const badCurrentData = await badCurrentRes.json();
  if (badCurrentRes.status === 401 || badCurrentRes.status === 400) {
    console.log('✅ Correctly rejected incorrect current password:', badCurrentData.error || badCurrentData.message);
  } else {
    console.error('❌ Expected 401/400 for incorrect current password, got:', badCurrentRes.status);
    process.exit(1);
  }

  // 2.3.b: New password is weak (e.g. no special character)
  const weakNewRes = await fetch(`${BASE_URL}/auth/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`
    },
    body: JSON.stringify({
      currentPassword: initialPassword,
      newPassword: 'WeakPassword123'
    })
  });
  const weakNewData = await weakNewRes.json();
  const weakNewMsg = weakNewData.error || weakNewData.message || '';
  if (weakNewRes.status === 400 && weakNewMsg.includes('special character')) {
    console.log('✅ Correctly rejected weak new password in change-password:', weakNewMsg);
  } else {
    console.error('❌ Expected 400 for weak new password, got:', weakNewRes.status, weakNewData);
    process.exit(1);
  }

  // 2.3.c: New password same as current password
  const sameNewRes = await fetch(`${BASE_URL}/auth/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`
    },
    body: JSON.stringify({
      currentPassword: initialPassword,
      newPassword: initialPassword
    })
  });
  const sameNewData = await sameNewRes.json();
  const sameNewMsg = sameNewData.error || sameNewData.message || '';
  if (sameNewRes.status === 400 && sameNewMsg.includes('same')) {
    console.log('✅ Correctly rejected identical new password:', sameNewMsg);
  } else {
    console.error('❌ Expected 400 for identical password, got:', sameNewRes.status, sameNewData);
    process.exit(1);
  }

  // 2.3.d: Successful Change Password
  console.log('\n--- 2.3.d Testing Valid Change Password ---');
  const validChangeRes = await fetch(`${BASE_URL}/auth/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${userToken}`
    },
    body: JSON.stringify({
      currentPassword: initialPassword,
      newPassword: updatedPassword
    })
  });
  const validChangeData = await validChangeRes.json();
  if (validChangeRes.status === 200 && validChangeData.success) {
    console.log('✅ Password successfully changed:', validChangeData.message);
  } else {
    console.error('❌ Valid change password failed:', validChangeRes.status, validChangeData);
    process.exit(1);
  }

  // Test 2.4: Verify Old Password Fails and New Password Succeeds
  console.log('\n--- 2.4 Verifying Login with New vs Old Password ---');
  const oldLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: initialPassword })
  });
  if (oldLoginRes.status === 401) {
    console.log('✅ Login with old password correctly rejected (401).');
  } else {
    console.error('❌ Old password still worked! Status:', oldLoginRes.status);
    process.exit(1);
  }

  const newLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: updatedPassword })
  });
  const newLoginData = await newLoginRes.json();
  if (newLoginRes.status === 200 && newLoginData.token) {
    console.log('✅ Login with new password succeeded.');
  } else {
    console.error('❌ Login with new password failed:', newLoginRes.status, newLoginData);
    process.exit(1);
  }

  // Test 2.5: Forgot & Reset Password Flow
  console.log('\n--- 2.5 Testing Password Reset Flow ---');
  const forgotRes = await fetch(`${BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail })
  });
  const forgotData = await forgotRes.json();
  const resetCode = forgotData.resetToken || forgotData.code;
  if (!resetCode) {
    console.error('❌ Reset code not returned in forgot-password response:', forgotData);
    process.exit(1);
  }
  console.log('✅ Forgot password initiated. Got reset code:', resetCode);

  // Attempt reset with invalid password (length > 15)
  const tooLongResetRes = await fetch(`${BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      code: resetCode,
      newPassword: 'WayTooLongPassword123@#$'
    })
  });
  const tooLongResetData = await tooLongResetRes.json();
  const tooLongMsg = tooLongResetData.error || tooLongResetData.message || '';
  if (tooLongResetRes.status === 400 && tooLongMsg.includes('15 characters')) {
    console.log('✅ Correctly rejected >15 char password in reset-password:', tooLongMsg);
  } else {
    console.error('❌ Expected 400 for too long password in reset-password, got:', tooLongResetRes.status, tooLongResetData);
    process.exit(1);
  }

  // Attempt reset with valid password
  const validResetRes = await fetch(`${BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: testEmail,
      code: resetCode,
      newPassword: resetPassword
    })
  });
  const validResetData = await validResetRes.json();
  if (validResetRes.status === 200 && validResetData.success) {
    console.log('✅ Reset password succeeded with confirmation message:', validResetData.message);
  } else {
    console.error('❌ Valid reset-password failed:', validResetRes.status, validResetData);
    process.exit(1);
  }

  // Verify login with reset password
  const resetLoginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: resetPassword })
  });
  if (resetLoginRes.status === 200) {
    console.log('✅ Successfully logged in with newly reset password.');
  } else {
    console.error('❌ Login with reset password failed:', resetLoginRes.status);
    process.exit(1);
  }

  console.log('\n====================================================');
  console.log('🎉 ALL PASSWORD SECURITY & AUTH TESTS PASSED PERFECTLY!');
  console.log('====================================================');
}

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
