/**
 * Mock Tests Component
 * Displays three independent mock test blocks for each certification
 * Similar to practice tests but with exam-like conditions (timed, all questions at once)
 * 
 * Timing:
 * - AD0-E207: ~2 minutes per question
 * - AD0-E408: 100 minutes total
 * - AD0-E409: ~2 minutes per question
 */

export function renderMockTestsSelection(certifications) {
  const certificationsList = certifications.filter(cert => cert.contentAvailable);
  
  const testBlocksHtml = certificationsList
    .map(cert => {
      const count = cert.questionCount || 0;
      const testName = `${cert.code} - ${cert.name}`;
      const description = getMockTestDescription(cert.id);
      const icon = cert.icon || '🎯';
      
      return `
        <div class="mock-test-block">
          <div class="test-block-header">
            <div class="test-icon">${icon}</div>
            <div class="test-info">
              <h3>${testName}</h3>
              <p class="test-code">${cert.code}</p>
            </div>
          </div>
          
          <div class="test-block-body">
            <p class="test-description">${description}</p>
            
            <div class="test-stats">
              <div class="stat">
                <span class="stat-label">Questions</span>
                <span class="stat-value">${count}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Type</span>
                <span class="stat-value">Mock Exam</span>
              </div>
              <div class="stat">
                <span class="stat-label">Mode</span>
                <span class="stat-value">Timed</span>
              </div>
            </div>
            
            <div class="test-features">
              <h4>Exam Conditions:</h4>
              <ul>
                <li>✓ Timed exam environment</li>
                <li>✓ Full question set</li>
                <li>✓ Score & performance report</li>
                <li>✓ Domain-wise breakdown</li>
                <li>✓ Detailed answer review</li>
              </ul>
            </div>
          </div>
          
          <div class="test-block-footer">
            <button class="btn-start-mock ${count === 0 ? 'disabled' : ''}" data-action="start-mock" data-cert-id="${cert.id}" ${count === 0 ? 'disabled' : ''}>
              ${count === 0 ? 'Coming Soon' : 'Start Mock Exam'}
            </button>
            ${count === 0 ? '<p class="test-unavailable">Mock exam coming soon</p>' : ''}
          </div>
        </div>
      `;
    })
    .join('');
  
  return `
    <div class="mock-tests-container">
      <div class="mock-header">
        <h1>Mock Examinations</h1>
        <p class="mock-subtitle">Test yourself under real exam conditions with full-length mock tests</p>
      </div>
      
      <div class="mock-intro">
        <div class="intro-content">
          <p><strong>Simulate Real Exam Experience</strong></p>
          <p>Mock exams are designed to replicate the actual Adobe certification exam environment with:</p>
          <ul>
            <li>Time limit based on actual exam requirements</li>
            <li>All questions presented in one session</li>
            <li>No explanations during the test (like real exams)</li>
            <li>Detailed performance report after completion</li>
            <li>Domain-wise scoring breakdown</li>
            <li>Comparison with passing score</li>
          </ul>
        </div>
      </div>
      
      <div class="mock-tests-grid">
        ${testBlocksHtml}
      </div>
    </div>
  `;
}

function getMockTestDescription(certId) {
  const descriptions = {
    'ad0-e207': 'Full-length mock exam for Adobe Analytics Architect Master (AD0-E207). Experience the real exam format with timed conditions and performance metrics.',
    'ad0-e408': 'Full-length mock exam for Adobe Target Business Practitioner Professional (AD0-E408). Test under actual exam timing and conditions.',
    'ad0-e409': 'Full-length mock exam for Adobe Target Architect Master (AD0-E409). Complete mock test with advanced scenarios and time pressure.',
    'ad0-e607': 'Full-length mock exam for Adobe Journey Optimizer (AD0-E607). Complete mock test with journey, offer, and content scenarios.'
  };
  return descriptions[certId] || 'Mock examination for Adobe certification';
}
