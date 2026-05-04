import { ImageResponse } from 'next/og'
import { readFile } from 'fs/promises'
import { join } from 'path'

export const size        = { width: 180, height: 180 }
export const contentType = 'image/png'

export default async function AppleIcon() {
  const logoData = await readFile(join(process.cwd(), 'public/logo.webp'))
  const base64   = `data:image/webp;base64,${logoData.toString('base64')}`

  return new ImageResponse(
    <img src={base64} width={180} height={180} style={{ borderRadius: 36 }} />,
    { ...size }
  )
}
