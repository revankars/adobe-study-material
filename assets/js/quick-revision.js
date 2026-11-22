/**
 * Quick Revision Component
 * Displays three revision blocks for each certification subject
 * Users can select and access revision materials independently
 */

export function renderQuickRevisionSelection(certifications) {
  const certificationsList = certifications.filter(cert => cert.contentAvailable);
  
  // Map to get chapter/topic counts
  const topicCounts = {
    'ad0-e207': 12,  // Adobe Analytics Architect
    'ad0-e408': 8,   // Adobe Target Business Practitioner
    'ad0-e409': 15,  // Adobe Target Architect
    'ad0-e607': 8    // Adobe Journey Optimizer
  };
  
  const revisionBlocksHtml = certificationsList
    .map(cert => {
      const count = topicCounts[cert.id] || 0;
      const revisionName = `${cert.code} - ${cert.name}`;
      const description = getRevisionDescription(cert.id);
      const icon = cert.icon || '📚';
      
      return `
        <div class="revision-block">
          <div class="revision-block-header">
            <div class="revision-icon">${icon}</div>
            <div class="revision-info">
              <h3>${revisionName}</h3>
              <p class="revision-code">${cert.code}</p>
            </div>
          </div>
          
          <div class="revision-block-body">
            <p class="revision-description">${description}</p>
            
            <div class="revision-stats">
              <div class="stat">
                <span class="stat-label">Topics</span>
                <span class="stat-value">${count}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Type</span>
                <span class="stat-value">Revision</span>
              </div>
              <div class="stat">
                <span class="stat-label">Mode</span>
                <span class="stat-value">Review</span>
              </div>
            </div>
            
            <div class="revision-features">
              <h4>Quick Review Includes:</h4>
              <ul>
                <li>✓ Key concepts summary</li>
                <li>✓ Domain weighting guide</li>
                <li>✓ Important reminders</li>
                <li>✓ Best practices checklist</li>
                <li>✓ Quick troubleshooting tips</li>
              </ul>
            </div>
          </div>
          
          <div class="revision-block-footer">
            <button class="btn-start-revision ${count === 0 ? 'disabled' : ''}" data-action="start-revision" data-cert-id="${cert.id}" ${count === 0 ? 'disabled' : ''}>
              ${count === 0 ? 'Coming Soon' : 'Start Quick Revision'}
            </button>
            ${count === 0 ? '<p class="revision-unavailable">Content coming soon</p>' : ''}
          </div>
        </div>
      `;
    })
    .join('');
  
  return `
    <div class="quick-revision-container">
      <div class="revision-header">
        <h1>Quick Revision</h1>
        <p class="revision-subtitle">Fast review and troubleshooting guides for your Adobe certifications</p>
      </div>
      
      <div class="revision-intro">
        <p>Select a certification below to access quick revision materials. Perfect for:</p>
        <ul>
          <li>Last-minute study before the exam</li>
          <li>Reviewing key concepts and domains</li>
          <li>Quick reference during learning</li>
          <li>Reinforcing important topics</li>
        </ul>
      </div>
      
      <div class="quick-revision-grid">
        ${revisionBlocksHtml}
      </div>
    </div>
  `;
}

function getRevisionDescription(certId) {
  const descriptions = {
    'ad0-e207': 'Quick revision guide for Adobe Analytics Architect Master certification (AD0-E207). Fast reference for key concepts, domains, and best practices.',
    'ad0-e408': 'Quick revision guide for Adobe Target Business Practitioner Professional certification (AD0-E408). Essential topics and quick tips for exam preparation.',
    'ad0-e409': 'Quick revision guide for Adobe Target Architect Master certification (AD0-E409). Advanced concepts, troubleshooting, and architecture patterns.',
    'ad0-e607': 'Quick revision guide for Adobe Journey Optimizer certification (AD0-E607). Fast reference for journeys, offers, content, and platform fundamentals.'
  };
  return descriptions[certId] || 'Quick revision guide for Adobe certification';
}
