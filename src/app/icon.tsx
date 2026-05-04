import { ImageResponse } from 'next/og'
import { readFile } from 'fs/promises'
import { join } from 'path'

export const size        = { width: 32, height: 32 }
export const contentType = 'image/png'

export default async function Icon() {
  const logoData = await readFile(join(process.cwd(), 'public/logo.webp'))
  const base64   = `data:image/webp;base64,${logoData.toString('base64')}`

  return new ImageResponse(
    <img src={base64} width={32} height={32} style={{ borderRadius: 8 }} />,
    { ...size }
  )
}
