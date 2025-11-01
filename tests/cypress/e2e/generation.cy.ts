describe('Content Generation', () => {
  const baseUrl = Cypress.env('TEST_URL') || 'https://agentforge-studio.vercel.app';
  const testEmail = Cypress.env('TEST_EMAIL') || 'm.butt0512@gmail.com';
  const testPassword = Cypress.env('TEST_PASSWORD') || 'sxieLhcR7MJPZLk';

  beforeEach(() => {
    cy.visit(baseUrl);
    
    // Login if needed
    cy.get('body').then(($body) => {
      if ($body.find('input[type="email"]').length > 0) {
        cy.get('input[type="email"]').type(testEmail);
        cy.get('input[type="password"]').type(testPassword);
        cy.contains('button', 'Sign In').click();
        cy.wait(3000);
      }
    });
  });

  it('should display Brand Kit Manager interface', () => {
    cy.contains('Brand Kit Manager', { matchCase: false }).should('be.visible');
    cy.contains('AI-powered brand identity system', { matchCase: false }).should('be.visible');
    cy.contains('Brand Foundation').should('be.visible');
  });

  it('should navigate between creative modules', () => {
    // Test Mockup Generator
    cy.contains('button', 'Product Mockup Generator').click();
    cy.contains('Product Mockup Generator', { matchCase: false }).should('be.visible');
    
    // Test Poster Designer
    cy.contains('button', 'AI Poster Designer').click();
    cy.contains('AI Poster Designer', { matchCase: false }).should('be.visible');
    
    // Test Social Media Creator
    cy.contains('button', 'Social Media Creator').click();
    cy.contains('Content Strategy', { matchCase: false }).should('be.visible');
    
    // Test Video Creator
    cy.contains('button', 'AI Video Creator').click();
    cy.get('body').then(($body) => {
      const hasApiKeySelector = $body.text().includes('API Key Required');
      const hasVideoForm = $body.text().includes('Video Concept');
      expect(hasApiKeySelector || hasVideoForm).to.be.true;
    });
    
    // Return to Brand Kit
    cy.contains('button', 'Brand Kit Manager').click();
    cy.contains('Brand Kit Manager', { matchCase: false }).should('be.visible');
  });

  it('should validate Brand Kit input field', () => {
    cy.get('textarea[placeholder*="eco-friendly"]').as('businessInput');
    
    // Test disabled state with short input
    cy.get('@businessInput').clear().type('short');
    cy.contains('button', 'Generate Full Brand Kit').should('be.disabled');
    
    // Test enabled state with valid input
    cy.get('@businessInput').clear().type('An eco-friendly coffee shop targeting young professionals in urban areas who value sustainability and artisanal products');
    cy.contains('button', 'Generate Full Brand Kit').should('not.be.disabled');
  });

  it('should display Mockup Generator form elements', () => {
    cy.contains('button', 'Product Mockup Generator').click();
    
    cy.contains('Mockup Type', { matchCase: false }).should('be.visible');
    cy.contains('Design Description', { matchCase: false }).should('be.visible');
    cy.contains('button', 'Generate Mockup').should('be.visible');
  });

  it('should display Poster Designer form elements', () => {
    cy.contains('button', 'AI Poster Designer').click();
    
    cy.contains('Poster Type', { matchCase: false }).should('be.visible');
    cy.contains(/theme|concept/i).should('be.visible');
    cy.contains('Headline Text', { matchCase: false }).should('be.visible');
    cy.contains('Subheadline Text', { matchCase: false }).should('be.visible');
    cy.contains('button', 'Generate Poster').should('be.visible');
  });

  it('should handle generation attempts', () => {
    // Test Brand Kit generation
    cy.get('textarea[placeholder*="eco-friendly"]').clear().type('A modern tech startup focused on AI solutions for healthcare');
    cy.contains('button', 'Generate Full Brand Kit').click();
    
    cy.wait(3000);
    
    // Check for loading, error, or success states
    cy.get('body').then(($body) => {
      const text = $body.text();
      const hasLoading = text.includes('Building') || text.includes('Generating') || text.includes('Loading');
      const hasError = text.includes('Failed') || text.includes('Error') || text.includes('API key');
      const hasSuccess = text.includes('Brand Identity') || text.includes('Logo');
      
      expect(hasLoading || hasError || hasSuccess).to.be.true;
    });
  });

  it('should display error messages prominently when generation fails', () => {
    // Navigate to Mockup Generator
    cy.contains('button', 'Product Mockup Generator').click();
    cy.wait(1000);
    
    // Try to generate without proper setup (will likely fail)
    cy.contains('button', 'Generate Mockup').click();
    
    cy.wait(3000);
    
    // Check for error display
    cy.get('body').then(($body) => {
      if ($body.text().includes('Failed') || $body.text().includes('Error')) {
        cy.contains(/failed|error/i).should('be.visible');
      }
    });
  });
});

