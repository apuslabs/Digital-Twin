// Simple HTTP request test for APUS service

const APUS_ENDPOINT = 'https://hb2.apus.network/~llamacpp@1.0/chat/serialize~json@1.0';

async function testApusRequest() {
  try {
    // Create URL with test parameters
    const requestData = {
        reference:"1756732045654-10-20",
        session_id: "session_test_123",
        prompt: "Hello, this is a test message.",
    };

    console.log('Making request to:', APUS_ENDPOINT);

    const response = await fetch(APUS_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestData)
    });

    console.log('Response status:', response.status);
    console.log('Response OK:', response.ok);

    if (response.ok) {
      const data = await response.json();
      console.log('Response data:', data);
    } else {
      console.log('Error response:', await response.text());
    }

  } catch (error) {
    console.error('Request failed:', error);
  }
}

// Run the test
testApusRequest();
