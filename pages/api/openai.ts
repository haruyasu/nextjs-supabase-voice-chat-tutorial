import { Configuration, OpenAIApi } from 'openai'

import type { NextApiRequest, NextApiResponse } from 'next'

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
})

const openai = new OpenAIApi(configuration)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { prompt } = req.body

    // Create completion
    const response = await openai.createCompletion({
      model: 'text-davinci-003', // モデル
      prompt: `The following is a conversation with an AI assistant. The assistant is helpful, creative, clever.\nHuman: ${prompt}\nAI: `, // テキストプロンプト
      max_tokens: 1024, // 最大トークン
      temperature: 0.6, // ランダム値
      frequency_penalty: 0.5, // 同じ行を繰り返す可能性を減らす
      presence_penalty: 0, // 新しいトピックについて話す可能性を高める
    })

    // レスポンスを返す
    const text = response.data.choices[0].text

    res.status(200).json({ text })
  } catch (error) {
    console.error(error)
    res.status(500).send('Something went wrong')
  }
}
