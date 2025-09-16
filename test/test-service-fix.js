// Test the fixed APUS service
const APUS_ENDPOINT = 'http://72.46.85.207:20000/~llamacpp@1.0/chat/serialize~json@1.0';

async function testFixedApusService() {
  try {
    // Simulate the service logic with the correct response parsing
    const url = new URL(APUS_ENDPOINT);
    url.searchParams.append('reference', 'alex-test');
    url.searchParams.append('session_id', 'session_test_123');
    url.searchParams.append('prompt', 'You are helpful.\n\nHuman: Hello test\nAssistant: ');
    url.searchParams.append('config', JSON.stringify({
      max_tokens: 5000
    }));

    console.log('Making request to:', url.toString());

    const response = await fetch(url, {
      method: 'POST',
    });

    console.log('Response status:', response.status);
    console.log('Response OK:', response.ok);

    if (response.ok) {
      const data = await response.json();
      console.log('Raw response data:', data);
      
      // Parse like the service now does
      let responseText = '';
      if (data.body) {
        try {
          const bodyData = JSON.parse(data.body);
          responseText = bodyData.result || '';
          console.log('Parsed response text:', responseText);
        } catch (e) {
          responseText = data.body;
          console.log('Fallback response text:', responseText);
        }
      }
    } else {
      console.log('Error response:', await response.text());
    }

  } catch (error) {
    console.error('Request failed:', error);
  }
}

// Run the test
testFixedApusService();
