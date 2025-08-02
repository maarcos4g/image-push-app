import { useEffect, useRef, useState } from "react"
import { CloudUpload, Copy, FileInput, X } from "lucide-react"
import { useDropzone } from 'react-dropzone'
import { ProgressBar } from "./components/progress-bar"
import { MenuItem } from "./components/menu-item"
import { api } from "./http/config"
import { env } from "./env"
import { sendNotification } from "./utils/send-notification"
import { addLastUpload, getLastUploads } from "./utils/storage"

export function App() {
  const abortRef = useRef<AbortController>()

  const [uploadQueue, setUploadQueue] = useState<File[]>([])
  const [progress, setProgress] = useState(0)

  const {
    getRootProps,
    getInputProps,
    isDragActive,
    open: openFileDialog
  } = useDropzone({
    onDrop: handleStartUpload,
    multiple: false,
    noClick: true,
    noKeyboard: true,
  })

  useEffect(() => {
    if (Notification.permission !== 'granted') {
      Notification.requestPermission()
    }
  }, [])

  async function handleStartUpload(files: File[]) {
    if (!files || files.length === 0) {
      console.log('Nenhum arquivo selecionado.')
      return;
    }

    setProgress(0)
    setUploadQueue(files)

    const [file] = files

    if (!!file.type.startsWith('image/') === false) {
      console.log('Apenas imagens são permitidas.')
      sendNotification({
        title: 'Não permitido!',
        body: 'Apenas imagens são permitidas.'
      })
      setUploadQueue([])
      return;
    }

    const abortUpload = new AbortController()
    abortRef.current = abortUpload

    const formData = new FormData()
    formData.append('file', file)

    const uploadFileResponse = await api.post<{
      fileKey: string
    }>('/upload', formData, {
      signal: abortUpload.signal,
      onUploadProgress(progressEvent) {
        if (!progressEvent.progress) {
          return
        }

        const progressPercent = Math.round(progressEvent.progress * 100)

        setProgress(progressPercent)
      }
    })

    const { fileKey } = uploadFileResponse.data

    const fileURL = `${env.VITE_API_URL}/url/${fileKey}`
    navigator.clipboard.writeText(fileURL)

    addLastUpload(fileURL)

    sendNotification({
      title: 'Upload concluído!',
      body: 'URL copiada para área de transferência.'
    })

    setUploadQueue([])
  }

  function handleQuitApp() {
    console.log('Closing app...')
    window.ipcRenderer.send('quit-app')
  }

  function handleCancelUpload() {
    if (abortRef.current) {
      abortRef.current.abort()
    }

    setUploadQueue([])
  }

  function handleCopyLastUpload() {
    const uploads = getLastUploads()

    navigator.clipboard.writeText(uploads[0])
    sendNotification({
      title: 'Copiado!',
      body: 'URL copiada para área de transferência.'
    })
  }

  const status = uploadQueue.length > 0 ? 'accept'
    : isDragActive ? 'active'
      : 'pending'

  return (
    <div
      {...getRootProps()}
      className="w-full min-h-full">

      <input {...getInputProps()} />

      {status === 'active' && 'Start upload...'}

      {status === 'accept' && (
        <div className="w-full flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 text-xs">
            {uploadQueue.length > 1 ? (
              <p className="animate-pulse">
                Uploading {uploadQueue.length} file(s)...
              </p>
            ) : (
              <p className="animate-pulse">
                Uploading {uploadQueue[0].name.length > 14
                  ? uploadQueue[0].name.substring(0, 14).concat('...')
                  : uploadQueue[0].name}
              </p>
            )}

            <button
              className="text-red-500"
              title="Cancelar upload"
              onClick={handleCancelUpload}
            >
              <X className="size-3" />
            </button>
          </div>

          <ProgressBar progress={progress} />
        </div>
      )}

      {status === 'pending' && (
        <div
          className="border border-dashed border-zinc-500 px-3 py-10 rounded-lg bg-transparent flex items-center justify-center gap-2 text-zinc-300"
        >
          <CloudUpload className="size-4" />
          <span className="text-xs">Arraste e solte imagens aqui</span>
        </div>
      )}

      <div className="h-px mx-1 bg-white/20 mt-4" />

      <nav className="mt-4 px-1.5">
        <MenuItem onClick={openFileDialog} hotkey="mod+o">
          <FileInput className="w-4 h-4 stroke-[1.5px]" />
          Selecionar arquivo
        </MenuItem>

        <MenuItem onClick={handleCopyLastUpload} hotkey="mod+v">
          <Copy className="w-4 h-4 stroke-[1.5px]" />
          Último Upload
        </MenuItem>

        <MenuItem onClick={handleQuitApp} hotkey="mod+q">
          Fechar
        </MenuItem>
      </nav>
    </div>
  )
}