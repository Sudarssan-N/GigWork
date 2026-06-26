import { supabase } from './supabase'

const BUCKET = 'worker-documents'

export async function uploadWorkerDocument(userId: string, file: File): Promise<string> {
  const ext = file.name.split('.').pop() || 'jpg'
  const path = `${userId}/id-document.${ext}`

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    upsert: true,
    contentType: file.type,
  })

  if (error) throw new Error(error.message)
  return path
}