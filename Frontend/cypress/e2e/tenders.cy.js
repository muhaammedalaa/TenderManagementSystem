describe('Tenders Page E2E Tests', () => {
  beforeEach(() => {
    // Visit the tenders page
    cy.visit('/tenders');
    
    // Wait for the page to load
    cy.get('[data-testid="tenders-page"]', { timeout: 10000 }).should('be.visible');
  });

  it('should display tenders list', () => {
    // Check if the page title is visible
    cy.contains('Tenders').should('be.visible');
    
    // Check if the create button is visible
    cy.get('[data-testid="create-tender-btn"]').should('be.visible');
    
    // Check if the search bar is visible
    cy.get('[data-testid="search-bar"]').should('be.visible');
    
    // Check if the filter button is visible
    cy.get('[data-testid="filter-btn"]').should('be.visible');
  });

  it('should search tenders', () => {
    // Type in the search bar
    cy.get('[data-testid="search-bar"] input').type('Medical');
    
    // Wait for search results
    cy.wait(500);
    
    // Check if results are filtered
    cy.get('[data-testid="tenders-table"] tbody tr').should('have.length.at.least', 1);
  });

  it('should open and close filter panel', () => {
    // Click the filter button
    cy.get('[data-testid="filter-btn"]').click();
    
    // Check if filter panel is visible
    cy.get('[data-testid="filter-panel"]').should('be.visible');
    
    // Check if filter options are visible
    cy.get('[data-testid="status-filter"]').should('be.visible');
    cy.get('[data-testid="category-filter"]').should('be.visible');
    
    // Close the filter panel
    cy.get('[data-testid="close-filter-btn"]').click();
    
    // Check if filter panel is hidden
    cy.get('[data-testid="filter-panel"]').should('not.be.visible');
  });

  it('should filter tenders by status', () => {
    // Open filter panel
    cy.get('[data-testid="filter-btn"]').click();
    
    // Select a status filter
    cy.get('[data-testid="status-filter"] select').select('Open');
    
    // Apply the filter
    cy.get('[data-testid="apply-filter-btn"]').click();
    
    // Check if results are filtered
    cy.get('[data-testid="tenders-table"] tbody tr').should('have.length.at.least', 1);
  });

  it('should open create tender modal', () => {
    // Click the create button
    cy.get('[data-testid="create-tender-btn"]').click();
    
    // Check if modal is visible
    cy.get('[data-testid="create-tender-modal"]').should('be.visible');
    
    // Check if form fields are visible
    cy.get('[data-testid="tender-title-input"]').should('be.visible');
    cy.get('[data-testid="tender-description-input"]').should('be.visible');
    cy.get('[data-testid="tender-category-select"]').should('be.visible');
    
    // Close the modal
    cy.get('[data-testid="close-modal-btn"]').click();
    
    // Check if modal is hidden
    cy.get('[data-testid="create-tender-modal"]').should('not.be.visible');
  });

  it('should create a new tender', () => {
    // Click the create button
    cy.get('[data-testid="create-tender-btn"]').click();
    
    // Fill in the form
    cy.get('[data-testid="tender-title-input"]').type('Test Tender');
    cy.get('[data-testid="tender-description-input"]').type('Test Description');
    cy.get('[data-testid="tender-category-select"]').select('Medical');
    cy.get('[data-testid="tender-budget-input"]').type('100000');
    
    // Submit the form
    cy.get('[data-testid="submit-tender-btn"]').click();
    
    // Check if success message is shown
    cy.get('[data-testid="success-message"]').should('be.visible');
    
    // Check if modal is closed
    cy.get('[data-testid="create-tender-modal"]').should('not.be.visible');
  });

  it('should edit an existing tender', () => {
    // Wait for tenders to load
    cy.get('[data-testid="tenders-table"] tbody tr').should('have.length.at.least', 1);
    
    // Click the edit button for the first tender
    cy.get('[data-testid="tenders-table"] tbody tr:first-child [data-testid="edit-btn"]').click();
    
    // Check if edit modal is visible
    cy.get('[data-testid="edit-tender-modal"]').should('be.visible');
    
    // Update the title
    cy.get('[data-testid="tender-title-input"]').clear().type('Updated Tender Title');
    
    // Submit the form
    cy.get('[data-testid="submit-tender-btn"]').click();
    
    // Check if success message is shown
    cy.get('[data-testid="success-message"]').should('be.visible');
  });

  it('should delete a tender', () => {
    // Wait for tenders to load
    cy.get('[data-testid="tenders-table"] tbody tr').should('have.length.at.least', 1);
    
    // Click the delete button for the first tender
    cy.get('[data-testid="tenders-table"] tbody tr:first-child [data-testid="delete-btn"]').click();
    
    // Confirm deletion
    cy.get('[data-testid="confirm-delete-btn"]').click();
    
    // Check if success message is shown
    cy.get('[data-testid="success-message"]').should('be.visible');
  });

  it('should sort tenders by different columns', () => {
    // Wait for tenders to load
    cy.get('[data-testid="tenders-table"] tbody tr').should('have.length.at.least', 1);
    
    // Sort by title
    cy.get('[data-testid="tenders-table"] thead th[data-testid="title-header"]').click();
    
    // Sort by status
    cy.get('[data-testid="tenders-table"] thead th[data-testid="status-header"]').click();
    
    // Sort by budget
    cy.get('[data-testid="tenders-table"] thead th[data-testid="budget-header"]').click();
  });

  it('should paginate through tenders', () => {
    // Wait for tenders to load
    cy.get('[data-testid="tenders-table"] tbody tr').should('have.length.at.least', 1);
    
    // Check if pagination is visible
    cy.get('[data-testid="pagination"]').should('be.visible');
    
    // Click next page if available
    cy.get('[data-testid="pagination"]').then(($pagination) => {
      if ($pagination.find('[data-testid="next-page-btn"]').length > 0) {
        cy.get('[data-testid="next-page-btn"]').click();
      }
    });
  });
});


