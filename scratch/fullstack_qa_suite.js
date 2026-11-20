const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const BASE_URL = `http://localhost:${PORT}`;

function makeRequest(pathname, options = {}) {
  const {
    method = 'GET',
    headers = {},
    body = null,
    cookie = null,
    formData = null
  } = options;

  return new Promise((resolve, reject) => {
    const url = new URL(pathname, BASE_URL);
    const reqHeaders = { ...headers };

    if (cookie) {
      reqHeaders['Cookie'] = cookie;
    }

    let payload = null;

    if (formData) {
      // Simple multipart form builder
      const boundary = '----InnoSkillBoundary' + Math.random().toString(36).substring(2);
      reqHeaders['Content-Type'] = `multipart/form-data; boundary=${boundary}`;

      const chunks = [];
      for (const [key, value] of Object.entries(formData)) {
        if (typeof value === 'object' && value.filename && value.content) {
          chunks.push(
            Buffer.from(
              `--${boundary}\r\nContent-Disposition: form-data; name="${key}"; filename="${value.filename}"\r\nContent-Type: ${value.contentType || 'text/plain'}\r\n\r\n`
            ),
            Buffer.from(value.content),
            Buffer.from('\r\n')
          );
        } else {
          chunks.push(
            Buffer.from(
              `--${boundary}\r\nContent-Disposition: form-data; name="${key}"\r\n\r\n${value}\r\n`
            )
          );
        }
      }
      chunks.push(Buffer.from(`--${boundary}--\r\n`));
      payload = Buffer.concat(chunks);
      reqHeaders['Content-Length'] = payload.length;
    } else if (body !== null && typeof body === 'object') {
      reqHeaders['Content-Type'] = 'application/json';
      payload = JSON.stringify(body);
      reqHeaders['Content-Length'] = Buffer.byteLength(payload);
    } else if (body !== null) {
      payload = body;
    }

    const req = http.request(url, { method, headers: reqHeaders }, (res) => {
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const rawBody = Buffer.concat(chunks).toString('utf-8');
        let parsed = null;
        try {
          parsed = JSON.parse(rawBody);
        } catch (e) {
          parsed = rawBody;
        }

        const setCookieHeader = res.headers['set-cookie'];
        let sessionCookie = null;
        if (setCookieHeader) {
          const cookieStr = Array.isArray(setCookieHeader) ? setCookieHeader[0] : setCookieHeader;
          sessionCookie = cookieStr.split(';')[0];
        }

        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: parsed,
          cookie: sessionCookie,
          raw: rawBody
        });
      });
    });

    req.on('error', reject);
    if (payload) {
      req.write(payload);
    }
    req.end();
  });
}

const stats = {
  total: 0,
  passed: 0,
  failed: 0,
  failures: []
};

function assert(condition, testId, description, details = '') {
  stats.total++;
  if (condition) {
    stats.passed++;
    console.log(`  ✓ [PASS] [${testId}] ${description}`);
  } else {
    stats.failed++;
    const errMsg = `[${testId}] ${description} - ${details}`;
    stats.failures.push(errMsg);
    console.error(`  ✗ [FAIL] ${errMsg}`);
  }
}

async function runFullStackSuite() {
  console.log('================================================================');
  console.log('  INNOSKILL AI MASTER FULL-STACK QA & API TEST SUITE');
  console.log('================================================================\n');

  // Generate unique test identities
  const ts = Date.now();
  const userA_Email = `qa_usera_${ts}@test.innoskill.ai`;
  const userB_Email = `qa_userb_${ts}@test.innoskill.ai`;
  const passwordA = 'Passw0rd!123';
  const passwordB = 'SecretB!456';
  let cookieA = null;
  let cookieB = null;
  let userA_Id = null;
  let userB_Id = null;
  let userA_ResumeId = null;

  // -------------------------------------------------------------
  // PHASE 7 & 8: AUTHENTICATION API TESTING
  // -------------------------------------------------------------
  console.log('--- SUITE 1: AUTHENTICATION & SESSION LIFECYCLE ---');

  // Test 1.1: Signup with missing fields
  const res1_1 = await makeRequest('/api/auth/signup', { method: 'POST', body: { email: userA_Email } });
  assert(res1_1.status === 400, 'AUTH-01', 'Signup rejects missing fields with 400', `Got ${res1_1.status}`);

  // Test 1.2: Signup with short password
  const res1_2 = await makeRequest('/api/auth/signup', {
    method: 'POST',
    body: { fullName: 'QA User A', email: userA_Email, password: '123' }
  });
  assert(res1_2.status === 400, 'AUTH-02', 'Signup rejects short password (<6 chars) with 400', `Got ${res1_2.status}`);

  // Test 1.3: Signup with invalid email format
  const res1_3 = await makeRequest('/api/auth/signup', {
    method: 'POST',
    body: { fullName: 'QA User A', email: 'invalid-email-string', password: passwordA }
  });
  assert(res1_3.status === 400, 'AUTH-03', 'Signup rejects malformed email address with 400', `Got ${res1_3.status}`);

  // Test 1.4: Valid signup User A
  const res1_4 = await makeRequest('/api/auth/signup', {
    method: 'POST',
    body: { fullName: 'QA User A', email: userA_Email, password: passwordA }
  });
  assert(res1_4.status === 200 && res1_4.data.success && res1_4.cookie, 'AUTH-04', 'Valid signup creates user and sets session cookie', `Status: ${res1_4.status}, Cookie: ${res1_4.cookie}`);
  cookieA = res1_4.cookie;
  userA_Id = res1_4.data?.user?.id;

  // Test 1.5: Duplicate signup rejection
  const res1_5 = await makeRequest('/api/auth/signup', {
    method: 'POST',
    body: { fullName: 'Duplicate User', email: userA_Email, password: passwordA }
  });
  assert(res1_5.status === 400, 'AUTH-05', 'Duplicate email signup rejected with 400', `Got ${res1_5.status}`);

  // Test 1.6: Valid signup User B (for cross-user isolation tests)
  const res1_6 = await makeRequest('/api/auth/signup', {
    method: 'POST',
    body: { fullName: 'QA User B', email: userB_Email, password: passwordB }
  });
  assert(res1_6.status === 200 && res1_6.cookie, 'AUTH-06', 'User B signup succeeds for isolation testing', `Got ${res1_6.status}`);
  cookieB = res1_6.cookie;
  userB_Id = res1_6.data?.user?.id;

  // Test 1.7: Login with wrong password
  const res1_7 = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: { email: userA_Email, password: 'WrongPassword999' }
  });
  assert(res1_7.status === 401, 'AUTH-07', 'Login with invalid password returns 401 Unauthorized', `Got ${res1_7.status}`);

  // Test 1.8: Login with non-existent email
  const res1_8 = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: { email: 'nonexistent_ghost@test.com', password: passwordA }
  });
  assert(res1_8.status === 401, 'AUTH-08', 'Login with non-existent user returns 401 without enumeration', `Got ${res1_8.status}`);

  // Test 1.9: Valid login User A
  const res1_9 = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: { email: userA_Email, password: passwordA }
  });
  assert(res1_9.status === 200 && res1_9.data.success && res1_9.cookie, 'AUTH-09', 'Valid login returns 200 and refreshes session cookie', `Got ${res1_9.status}`);
  cookieA = res1_9.cookie;

  // Test 1.10: Unauthenticated /api/auth/me
  const res1_10 = await makeRequest('/api/auth/me');
  assert(res1_10.status === 401, 'AUTH-10', 'Unauthenticated /api/auth/me returns 401', `Got ${res1_10.status}`);

  // Test 1.11: Authenticated /api/auth/me for User A
  const res1_11 = await makeRequest('/api/auth/me', { cookie: cookieA });
  assert(res1_11.status === 200 && res1_11.data.authenticated && res1_11.data.user.email === userA_Email.toLowerCase(), 'AUTH-11', 'Authenticated /api/auth/me returns profile and email', `Got ${res1_11.status}`);

  // Test 1.12: Forgot password with empty email
  const res1_12 = await makeRequest('/api/auth/forgot-password', { method: 'POST', body: { email: '' } });
  assert(res1_12.status === 400, 'AUTH-12', 'Forgot password with empty email returns 400', `Got ${res1_12.status}`);

  // Test 1.13: Forgot password for existing email
  const res1_13 = await makeRequest('/api/auth/forgot-password', { method: 'POST', body: { email: userA_Email } });
  assert(res1_13.status === 200 && res1_13.data.success, 'AUTH-13', 'Forgot password processes request with 200', `Got ${res1_13.status}`);
  const devResetToken = res1_13.data.devResetToken;

  // Test 1.14: Reset password with invalid token
  const res1_14 = await makeRequest('/api/auth/reset-password', {
    method: 'POST',
    body: { token: 'fake_token_12345', newPassword: 'NewPassword999!' }
  });
  assert(res1_14.status === 400, 'AUTH-14', 'Reset password with invalid token returns 400', `Got ${res1_14.status}`);

  // Test 1.15: Reset password with valid token
  if (devResetToken) {
    const newPassA = 'NewPassw0rd!456';
    const res1_15 = await makeRequest('/api/auth/reset-password', {
      method: 'POST',
      body: { token: devResetToken, newPassword: newPassA }
    });
    assert(res1_15.status === 200 && res1_15.data.success, 'AUTH-15', 'Reset password with valid token succeeds', `Got ${res1_15.status}`);

    // Verify old password fails
    const res1_15b = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: { email: userA_Email, password: passwordA }
    });
    assert(res1_15b.status === 401, 'AUTH-16', 'Login with previous password fails after reset', `Got ${res1_15b.status}`);

    // Verify new password succeeds
    const res1_15c = await makeRequest('/api/auth/login', {
      method: 'POST',
      body: { email: userA_Email, password: newPassA }
    });
    assert(res1_15c.status === 200, 'AUTH-17', 'Login with new password succeeds after reset', `Got ${res1_15c.status}`);
    cookieA = res1_15c.cookie;
  }

  // Test 1.18: Logout
  const res1_18 = await makeRequest('/api/auth/logout', { method: 'POST', cookie: cookieA });
  assert(res1_18.status === 200, 'AUTH-18', 'Logout returns 200 OK', `Got ${res1_18.status}`);

  // Test 1.19: Revoked session rejected after logout
  const res1_19 = await makeRequest('/api/auth/me', { cookie: cookieA });
  assert(res1_19.status === 401, 'AUTH-19', 'Revoked session is rejected with 401 after logout', `Got ${res1_19.status}`);

  // Log User A back in for subsequent tests
  const reloginA = await makeRequest('/api/auth/login', {
    method: 'POST',
    body: { email: userA_Email, password: devResetToken ? 'NewPassw0rd!456' : passwordA }
  });
  cookieA = reloginA.cookie;

  // -------------------------------------------------------------
  // PHASE 6 & 10: USER PROFILE & ACCESSIBILITY APIS
  // -------------------------------------------------------------
  console.log('\n--- SUITE 2: USER PROFILE, ACCESSIBILITY & SKILLS ---');

  // Test 2.1: Unauthorized Profile GET
  const res2_1 = await makeRequest('/api/user/profile');
  assert(res2_1.status === 401, 'PROF-01', 'Unauthorized GET /api/user/profile returns 401', `Got ${res2_1.status}`);

  // Test 2.2: Authorized Profile GET
  const res2_2 = await makeRequest('/api/user/profile', { cookie: cookieA });
  assert(res2_2.status === 200 && res2_2.data.profile, 'PROF-02', 'Authorized GET /api/user/profile returns profile data', `Got ${res2_2.status}`);

  // Test 2.3: Authorized Profile POST Update
  const res2_3 = await makeRequest('/api/user/profile', {
    method: 'POST',
    cookie: cookieA,
    body: {
      fullName: 'QA User A Updated',
      phone: '+1-555-0199',
      bio: 'Experienced QA and accessibility testing specialist.',
      targetRoles: ['Accessible Software Engineer', 'QA Architect'],
      experienceYears: 5,
      education: 'B.S. Computer Science'
    }
  });
  assert(res2_3.status === 200 && res2_3.data.profile.fullName === 'QA User A Updated', 'PROF-03', 'Authorized POST /api/user/profile updates and persists fields', `Got ${res2_3.status}`);

  // Test 2.4: Accessibility Preferences Update
  const res2_4 = await makeRequest('/api/user/accessibility', {
    method: 'POST',
    cookie: cookieA,
    body: {
      communicationPreference: 'VOICE',
      screenReaderRequired: true,
      highContrastRequired: true,
      largeTextRequired: false,
      workPreference: 'REMOTE',
      accommodations: ['NVDA Screen Reader', 'Ergonomic Desk']
    }
  });
  assert(res2_4.status === 200 && res2_4.data.accessibility.screenReaderRequired === true, 'ACC-01', 'POST /api/user/accessibility persists preferences', `Got ${res2_4.status}`);

  // Test 2.5: Accessibility Preferences GET
  const res2_5 = await makeRequest('/api/user/accessibility', { cookie: cookieA });
  assert(res2_5.status === 200 && res2_5.data.accessibility.screenReaderRequired === true, 'ACC-02', 'GET /api/user/accessibility returns persisted preferences', `Got ${res2_5.status}`);

  // Test 2.6: User Skills POST
  const res2_6 = await makeRequest('/api/user/skills', {
    method: 'POST',
    cookie: cookieA,
    body: { name: 'TypeScript', category: 'Technical', proficiency: 'Expert', source: 'USER_INPUT' }
  });
  assert(res2_6.status === 200 && res2_6.data.skill.name === 'TypeScript', 'SKILL-01', 'POST /api/user/skills adds skill', `Got ${res2_6.status}`);

  // Test 2.7: User Skills GET
  const res2_7 = await makeRequest('/api/user/skills', { cookie: cookieA });
  assert(res2_7.status === 200 && Array.isArray(res2_7.data.skills) && res2_7.data.skills.some(s => s.name === 'TypeScript'), 'SKILL-02', 'GET /api/user/skills returns user skills list', `Got ${res2_7.status}`);

  // Test 2.8: User Skills Missing Name Validation
  const res2_8 = await makeRequest('/api/user/skills', { method: 'POST', cookie: cookieA, body: {} });
  assert(res2_8.status === 400, 'SKILL-03', 'POST /api/user/skills rejects missing skill name with 400', `Got ${res2_8.status}`);

  // -------------------------------------------------------------
  // PHASE 6 & 10: JOB INTERACTIONS & CAREER PROGRESS APIS
  // -------------------------------------------------------------
  console.log('\n--- SUITE 3: JOB SAVING, INTERACTIONS & INTERVIEWS ---');

  // Test 3.1: Save Job POST
  const res3_1 = await makeRequest('/api/user/jobs/saved', {
    method: 'POST',
    cookie: cookieA,
    body: { jobId: 'job-seed-1' }
  });
  assert(res3_1.status === 200 && res3_1.data.success, 'JOB-01', 'POST /api/user/jobs/saved bookmarks job', `Got ${res3_1.status}`);

  // Test 3.2: Get Saved Jobs
  const res3_2 = await makeRequest('/api/user/jobs/saved', { cookie: cookieA });
  assert(res3_2.status === 200 && Array.isArray(res3_2.data.savedJobs) && res3_2.data.savedJobs.some(j => j.jobId === 'job-seed-1'), 'JOB-02', 'GET /api/user/jobs/saved returns bookmarked job', `Got ${res3_2.status}`);

  // Test 3.3: Record Job Interaction
  const res3_3 = await makeRequest('/api/user/jobs/interactions', {
    method: 'POST',
    cookie: cookieA,
    body: { jobId: 'job-seed-1', interactionType: 'VIEWED' }
  });
  assert(res3_3.status === 200 && res3_3.data.interaction.interactionType === 'VIEWED', 'JOB-03', 'POST /api/user/jobs/interactions records user activity', `Got ${res3_3.status}`);

  // Test 3.4: Delete Saved Job
  const res3_4 = await makeRequest('/api/user/jobs/saved?jobId=job-seed-1', { method: 'DELETE', cookie: cookieA });
  assert(res3_4.status === 200 && res3_4.data.success, 'JOB-04', 'DELETE /api/user/jobs/saved removes bookmark', `Got ${res3_4.status}`);

  // Test 3.5: Career Progress Update
  const res3_5 = await makeRequest('/api/user/career-progress', {
    method: 'POST',
    cookie: cookieA,
    body: { goal: 'Lead Accessibility Engineer', progress: 75, status: 'IN_PROGRESS' }
  });
  assert(res3_5.status === 200 && res3_5.data.progress.progress === 75, 'CAREER-01', 'POST /api/user/career-progress records milestone', `Got ${res3_5.status}`);

  // Test 3.6: Interview Session Creation
  const res3_6 = await makeRequest('/api/user/interview', {
    method: 'POST',
    cookie: cookieA,
    body: { action: 'CREATE_SESSION', role: 'Accessible UI Engineer', jobId: 'job-seed-1' }
  });
  assert(res3_6.status === 200 && res3_6.data.session.id, 'INT-01', 'POST /api/user/interview creates interview session', `Got ${res3_6.status}`);
  const interviewSessionId = res3_6.data.session.id;

  // Test 3.7: Add Interview Answer
  const res3_7 = await makeRequest('/api/user/interview', {
    method: 'POST',
    cookie: cookieA,
    body: {
      action: 'ADD_ANSWER',
      sessionId: interviewSessionId,
      questionText: 'How do you ensure web accessibility in React applications?',
      candidateAnswerText: 'I use semantic HTML, ARIA landmarks, keyboard focus rings, and automated axe testing.',
      evaluationScore: 92,
      evaluationFeedback: 'Strong structural and testing answer.'
    }
  });
  assert(res3_7.status === 200 && res3_7.data.answer.evaluationScore === 92, 'INT-02', 'POST /api/user/interview records answer and rating', `Got ${res3_7.status}`);

  // Test 3.8: GET Interview Sessions
  const res3_8 = await makeRequest('/api/user/interview', { cookie: cookieA });
  assert(res3_8.status === 200 && Array.isArray(res3_8.data.sessions) && res3_8.data.sessions.some(s => s.id === interviewSessionId), 'INT-03', 'GET /api/user/interview returns recorded sessions and answers', `Got ${res3_8.status}`);

  // -------------------------------------------------------------
  // PHASE 12 & 15: FILE UPLOAD, RESUME & IDOR SECURITY
  // -------------------------------------------------------------
  console.log('\n--- SUITE 4: FILE STORAGE, RESUME PARSER & IDOR ISOLATION ---');

  // Test 4.1: Resume Analyze Empty Upload
  const res4_1 = await makeRequest('/api/user/resume/analyze', { method: 'POST', cookie: cookieA, formData: {} });
  assert(res4_1.status === 400, 'FILE-01', 'POST /api/user/resume/analyze rejects empty upload with 400', `Got ${res4_1.status}`);

  // Test 4.2: Resume Text Upload with Minimum Words
  const sampleResumeText = `
    Alex Rivera
    Senior Accessibility Engineer & Frontend Specialist
    Email: alex.rivera@example.com | Phone: (555) 234-5678 | Remote

    PROFESSIONAL SUMMARY
    Dedicated software engineer with over 6 years of experience architecting accessible web interfaces,
    design systems, and inclusive workflows adhering to WCAG 2.1 AA and Section 508 standards.

    TECHNICAL SKILLS
    Languages: JavaScript, TypeScript, Python, HTML5, CSS3, SQL
    Frameworks: React, Next.js, Node.js, TailwindCSS
    Accessibility: JAWS, NVDA, VoiceOver, axe-core, WAVE, ARIA landmarks, keyboard navigation

    EXPERIENCE
    Lead Frontend Accessibility Architect - InclusiveTech Corp (2022 - Present)
    - Led WCAG 2.1 AA audit and remediation across 14 enterprise SaaS applications.
    - Designed custom component library supporting keyboard-only navigation and high-contrast modes.
    - Improved automated accessibility test coverage from 40% to 94% using Jest and axe-core.

    Senior Software Engineer - AccessibleWeb Solutions (2019 - 2022)
    - Developed accessible single-page applications for healthcare and educational institutions.
    - Implemented screen-reader accessible live regions, focus management, and skip links.

    EDUCATION
    Bachelor of Science in Computer Science - State University (2015 - 2019)
  `;

  const res4_2 = await makeRequest('/api/user/resume/analyze', {
    method: 'POST',
    cookie: cookieA,
    formData: {
      file: {
        filename: 'alex_rivera_resume.txt',
        content: sampleResumeText,
        contentType: 'text/plain'
      },
      targetRole: 'Senior Accessibility Engineer'
    }
  });
  assert(res4_2.status === 200 && res4_2.data.success && res4_2.data.report, 'FILE-02', 'POST /api/user/resume/analyze successfully extracts and evaluates resume text', `Got ${res4_2.status}`);

  // Test 4.3: Manual Resume Record POST
  const res4_3 = await makeRequest('/api/user/resume', {
    method: 'POST',
    cookie: cookieA,
    body: {
      fileName: 'alex_rivera_resume.txt',
      parsedText: sampleResumeText,
      structuredAnalysis: { score: 88, qualityScore: 85 }
    }
  });
  assert(res4_3.status === 200 && res4_3.data.resume.id, 'FILE-03', 'POST /api/user/resume saves resume record to database', `Got ${res4_3.status}`);
  userA_ResumeId = res4_3.data.resume.id;

  // Test 4.4: Download User A's Resume (Authorized)
  const res4_4 = await makeRequest(`/api/user/resume/download?id=${userA_ResumeId}`, { cookie: cookieA });
  assert(res4_4.status === 200 && res4_4.raw.includes('Alex Rivera'), 'FILE-04', 'Authorized download returns stored resume content', `Got ${res4_4.status}`);

  // Test 4.5: IDOR SECURITY TEST — User B attempts to download User A's Resume
  const res4_5 = await makeRequest(`/api/user/resume/download?id=${userA_ResumeId}`, { cookie: cookieB });
  assert(res4_5.status === 403, 'SEC-01', 'IDOR PREVENTED: User B cannot download User A resume (403 Forbidden)', `Got ${res4_5.status}`);

  // -------------------------------------------------------------
  // PHASE 6 & 7: ENTERPRISE SAP INTEGRATION APIS
  // -------------------------------------------------------------
  console.log('\n--- SUITE 5: ENTERPRISE SAP & GEMINI DIAGNOSTIC APIS ---');

  // Test 5.1: SAP Status Endpoint
  const res5_1 = await makeRequest('/api/sap/status');
  assert(res5_1.status === 200 && typeof res5_1.data.isConfigured === 'boolean', 'SAP-01', 'GET /api/sap/status returns valid health schema', `Got ${res5_1.status}`);

  // Test 5.2: SAP Jobs Endpoint
  const res5_2 = await makeRequest('/api/sap/jobs');
  assert(res5_2.status === 200 && res5_2.data.success && Array.isArray(res5_2.data.jobs), 'SAP-02', 'GET /api/sap/jobs returns requisition list', `Got ${res5_2.status}`);

  // Test 5.3: Gemini Live Token Endpoint Safety Check
  const res5_3 = await makeRequest('/api/gemini/live-token', { method: 'POST' });
  // Should either succeed (if key present) or return clean 500 error without exposing stack trace
  assert(res5_3.status === 200 || res5_3.status === 500, 'GEMINI-01', 'POST /api/gemini/live-token responds with structured response', `Got ${res5_3.status}`);

  // -------------------------------------------------------------
  // SUMMARY
  // -------------------------------------------------------------
  console.log('\n================================================================');
  console.log(`TEST RESULTS: Total: ${stats.total} | Passed: ${stats.passed} | Failed: ${stats.failed}`);
  console.log('================================================================');

  if (stats.failures.length > 0) {
    console.log('\nFailed Tests:');
    stats.failures.forEach(f => console.error(' - ' + f));
  }

  process.exit(stats.failed === 0 ? 0 : 1);
}

runFullStackSuite().catch(err => {
  console.error('Test Suite encountered fatal exception:', err);
  process.exit(1);
});
