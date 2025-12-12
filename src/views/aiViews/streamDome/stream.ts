
//设置流式接口返回值

export async function getResponse() {
  const response = await fetch('/api/stream', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: '你好',
    }),
  });

  const reader = response.body?.getReader();

  while(1) {
    const textDecoder = new TextDecoder();
    const { value, done } = await reader?.read() || {};
    //如果结束，则跳出循环
    if (done) {
      break;
    }
    const chunk = textDecoder.decode(value);
    console.log(chunk);
  }




}