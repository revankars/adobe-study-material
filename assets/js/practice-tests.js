/**
 * Practice Tests Component
 * Displays three independent practice test blocks for each certification
 * Users can select and take tests independently
 */

export function renderPracticeTestsSelection(certifications) {
  const certificationsList = certifications.filter(cert => cert.contentAvailable);
  
  const testBlocksHtml = certificationsList
    .map(cert => {
      const count = cert.questionCount || 0;
      const testName = `${cert.code} - ${cert.name}`;
      const description = getTestDescription(cert.id);
      const icon = cert.icon || '📝';
      
      return `
        <div class="practice-test-block">
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
                <span class="stat-value">Practice</span>
              </div>
              <div class="stat">
                <span class="stat-label">Mode</span>
                <span class="stat-value">Learning</span>
              </div>
            </div>
            
            <div class="test-features">
              <h4>What's Included:</h4>
              <ul>
                <li>✓ Detailed explanations</li>
                <li>✓ Instant feedback</li>
                <li>✓ Progress tracking</li>
                <li>✓ Score report</li>
                <li>✓ Review all questions</li>
              </ul>
            </div>
          </div>
          
          <div class="test-block-footer">
            <button class="btn-start-test ${count === 0 ? 'disabled' : ''}" data-action="start-practice" data-cert-id="${cert.id}" ${count === 0 ? 'disabled' : ''}>
              ${count === 0 ? 'Coming Soon' : 'Start Practice Test'}
            </button>
            ${count === 0 ? '<p class="test-unavailable">Questions coming soon</p>' : ''}
          </div>
        </div>
      `;
    })
    .join('');
  
  return `
    <div class="practice-tests-container">
      <div class="practice-header">
        <h1>Practice Tests</h1>
        <p class="practice-subtitle">Master your Adobe certification exams with independent practice tests</p>
      </div>
      
      <div class="practice-intro">
        <p>Select a certification below to start practicing. Each test is designed to help you:</p>
        <ul>
          <li>Identify knowledge gaps</li>
          <li>Build exam confidence</li>
          <li>Learn from detailed explanations</li>
          <li>Track your progress</li>
        </ul>
      </div>
      
      <div class="practice-tests-grid">
        ${testBlocksHtml}
      </div>
    </div>
  `;
}

function getTestDescription(certId) {
  const descriptions = {
    'ad0-e207': 'Practice for Adobe Analytics Architect Master certification (AD0-E207). Test your knowledge of analytics implementation, architecture, and best practices.',
    'ad0-e408': 'Practice for Adobe Target Business Practitioner Professional certification (AD0-E408). Master the fundamentals of target implementation and optimization.',
    'ad0-e409': 'Practice for Adobe Target Architect Master certification (AD0-E409). Advanced practice covering architecture, integration, and troubleshooting.',
    'ad0-e607': 'Practice for Adobe Journey Optimizer certification (AD0-E607). Master journey optimization, offer decisioning, and content authoring.'
  };
  return descriptions[certId] || 'Practice test for Adobe certification';
}
