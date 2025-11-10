import { Mistral } from '@mistralai/mistralai';
// Xg47haGtcYpHLGOqG9Iysp23Esl2tvp6
const apiKey = "Xg47haGtcYpHLGOqG9Iysp23Esl2tvp6";
export const mistralai =async()=>{
  const client = new Mistral({apiKey: apiKey});
// test mistral large latest model
  const chatResponse:any = await client.chat.complete({
    model: 'mistral-large-latest',
    messages: [{role: 'user', content: 'tell me 5 august 2024 of bangladesh'}],
  });
  
  console.log('Chat:', chatResponse.choices[0].message.content);
}


export const mistralai2 =async()=>{
  const client = new Mistral({apiKey: apiKey});

  const chatResponse:any = await client.chat.complete({
    model: "pixtral-12b",
    messages: [{role: 'user',     content: [
        { type: "text", text: "What's in this image?" },
        {
          type: "image_url",
          imageUrl: "https://tripfixers.com/wp-content/uploads/2019/11/eiffel-tower-with-snow.jpeg",
        },
      ],}],
  });
  
  console.log('Chat:', chatResponse.choices[0].message.content);
}
