import { transcribeAudio } from '../src/agent';

async function testAudioExport() {
  console.log('Testing Audio Transcribe interface...');
  if (typeof transcribeAudio !== 'function') {
    throw new Error('transcribeAudio is not exported as a function');
  }

  try {
    // Should throw if empty API key
    await transcribeAudio({
      audioBuffer: Buffer.from('empty'),
      apiKey: '',
    });
    throw new Error('Expected error with missing API key');
  } catch (err: any) {
    if (!err.message.includes('API Key is not configured')) {
      throw err;
    }
  }
  console.log('✓ Audio transcription export & validation tests passed.');
}

testAudioExport().catch((err) => {
  console.error('Audio test failed:', err);
  process.exit(1);
});
