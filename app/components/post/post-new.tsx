'use client'

import { KeyboardEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSupabase } from '../supabase-provider'

// 新規投稿
const PostNew = () => {
  const { supabase } = useSupabase()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [prompt, setPrompt] = useState('')

  // 送信
  const onSubmit = async () => {
    if (prompt) {
      try {
        // Postテーブル追加
        const { data: insertData, error: insertError } = await supabase
          .from('posts')
          .insert({
            prompt,
          })
          .select()

        if (insertError) {
          alert(insertError.message)
          return
        }

        // 入力フォームクリア
        setPrompt('')

        // キャッシュクリア
        router.refresh()

        // GPTローディング開始
        setLoading(true)

        // テキストプロンプトをAPIに送信
        const body = JSON.stringify({ prompt })
        const response = await fetch('/api/openai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body,
        })

        const response_data = await response.json()

        // Postテーブル更新
        const { error: updateError } = await supabase
          .from('posts')
          .update({
            content: response_data.text,
          })
          .eq('id', insertData[0].id)

        if (updateError) {
          alert(updateError.message)
          setLoading(false)
          return
        }

        // キャッシュクリア
        router.refresh()
      } catch (error) {
        alert(error)
      }
    }
    setLoading(false)
  }

  // 入力フォームでEnterが押されたら送信、Shift+Enterは改行
  const enterPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key == 'Enter' && e.shiftKey == false) {
      e.preventDefault()
      onSubmit()
    }
  }

  return (
    <div className="fixed bottom-0 left-2 right-2 h-40 flex flex-col justify-end items-center bg-[#7494C0] pb-5">
      {loading && (
        <div className="flex items-center justify-center space-x-3 my-2">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-yellow-500 border-t-transparent" />
          <div className="text-white font-bold">GPT is thinking!</div>
        </div>
      )}

      <textarea
        className="w-[752px] bg-gray-50 rounded py-3 px-3 outline-none focus:bg-white"
        id="prompt"
        name="prompt"
        placeholder="How are you?"
        onChange={(e) => setPrompt(e.target.value)}
        onKeyDown={(e) => enterPress(e)}
        value={prompt}
        rows={2}
        required
      />

      <div className="text-white text-sm mt-2">Shift+Enter: 改行, Enter: 送信</div>
    </div>
  )
}

export default PostNew
