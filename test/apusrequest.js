// Simple HTTP request test for APUS service

const APUS_ENDPOINT = 'https://hb.apus.network/~llamacpp@1.0/chat/serialize~json@1.0';

async function testApusRequest() {
  try {
    // Create URL with test parameters
    const url = new URL(APUS_ENDPOINT);
    url.searchParams.append('reference', 'alex-test');
    url.searchParams.append('session_id', 'session_test_123');
    url.searchParams.append('prompt', 'Hello, this is a test message.');
    url.searchParams.append('config', JSON.stringify({
      max_tokens: 100,
    }));

    console.log('Making request to:', url.toString());

    const response = await fetch(url, {
      method: 'POST',
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
