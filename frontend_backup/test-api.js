// Simple script to test API responses
async function testApi() {
  try {
    console.log('Testing API endpoints...');
    
    // Test categories endpoint
    console.log('\n--- Testing Categories ---');
    const categoriesResponse = await fetch('http://localhost:8000/api/effects/categories/');
    const categoriesData = await categoriesResponse.json();
    console.log('Status:', categoriesResponse.status);
    console.log('Categories data type:', typeof categoriesData);
    console.log('Is array:', Array.isArray(categoriesData));
    console.log('Categories:', JSON.stringify(categoriesData, null, 2));
    
    // Test effects endpoint
    console.log('\n--- Testing Effects ---');
    const effectsResponse = await fetch('http://localhost:8000/api/effects/effects/');
    const effectsData = await effectsResponse.json();
    console.log('Status:', effectsResponse.status);
    console.log('Effects data type:', typeof effectsData);
    console.log('Is array:', Array.isArray(effectsData));
    console.log('Effects count:', Array.isArray(effectsData) ? effectsData.length : 'N/A');
    console.log('First effect:', Array.isArray(effectsData) && effectsData.length > 0 ? JSON.stringify(effectsData[0], null, 2) : 'No effects');
    
  } catch (error) {
    console.error('API test failed:', error);
  }
}

testApi();