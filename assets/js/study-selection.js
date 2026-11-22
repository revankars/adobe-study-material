/**
 * Study Material Selection Component
 * Displays three study subject cards for each certification
 * Users can click to view complete study content in two-column layout
 */

export function renderStudyMaterialSelection(certifications) {
  const certificationsList = certifications.filter(cert => cert.contentAvailable);
  
  const studyCardsHtml = certificationsList
    .map(cert => {
      const guide = {
        name: `${cert.code} - ${cert.name}`,
        chapters: cert.studyChapters ?? 0,
        topics: cert.studyTopics ?? 0,
        description: cert.description || '',
      };
      const icon = cert.icon || '📚';
      
      return `
        <div class="study-subject-card">
          <div class="card-header">
            <div class="card-icon">${icon}</div>
            <div class="card-title">
              <h3>${guide.name}</h3>
              <p class="card-code">${cert.code}</p>
            </div>
          </div>
          
          <div class="card-body">
            <p class="card-description">${guide.description}</p>
            
            <div class="card-stats">
              <div class="stat">
                <span class="stat-label">Chapters</span>
                <span class="stat-value">${guide.chapters}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Topics</span>
                <span class="stat-value">${guide.topics}</span>
              </div>
              <div class="stat">
                <span class="stat-label">Type</span>
                <span class="stat-value">Comprehensive</span>
              </div>
            </div>
            
            <div class="card-benefits">
              <h4>Study Material Includes:</h4>
              <ul>
                <li>✓ Complete domain coverage</li>
                <li>✓ Key concepts and definitions</li>
                <li>✓ Implementation best practices</li>
                <li>✓ Common scenarios and solutions</li>
                <li>✓ Exam tips and strategies</li>
              </ul>
            </div>
          </div>
          
          <div class="card-footer">
            <button class="btn-start-study" data-action="open-study-material" data-cert-id="${cert.id}">
              Start Studying
            </button>
          </div>
        </div>
      `;
    })
    .join('');
  
  return `
    <div class="study-material-container">
      <div class="study-header">
        <h1>Study Material</h1>
        <p class="study-subtitle">Master certification exams with comprehensive study guides</p>
      </div>
      
      <div class="study-intro">
        <div class="intro-content">
          <p><strong>Comprehensive Study Guides</strong></p>
          <p>Each study guide provides complete coverage of certification requirements with:</p>
          <ul>
            <li>Well-organized chapters and sections</li>
            <li>Clear explanations of key concepts</li>
            <li>Real-world implementation examples</li>
            <li>Exam preparation strategies</li>
            <li>Quick reference sections</li>
          </ul>
        </div>
      </div>
      
      <div class="study-subjects-grid">
        ${studyCardsHtml}
      </div>
    </div>
  `;
}
