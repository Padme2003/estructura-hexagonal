import { useState, useEffect, useRef } from 'react'

// Hook personalizado para comandos de voz
export function useVoiceCommands(onCommand, options = {}) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState(null)
  const recognitionRef = useRef(null)

  useEffect(() => {
    // Verificar soporte del navegador
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Tu navegador no soporta reconocimiento de voz')
      return
    }

    // Crear instancia de reconocimiento
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SpeechRecognition()

    // Configuración
    recognition.lang = options.lang || 'es-EC' // Español de Ecuador
    recognition.continuous = options.continuous !== undefined ? options.continuous : true
    recognition.interimResults = options.interimResults !== undefined ? options.interimResults : false
    recognition.maxAlternatives = 1

    // Eventos
    recognition.onstart = () => {
      setIsListening(true)
      setError(null)
      console.log('🎤 Escuchando...')
    }

    recognition.onend = () => {
      setIsListening(false)
      console.log('🎤 Detenido')
    }

    recognition.onresult = (event) => {
      const last = event.results.length - 1
      const text = event.results[last][0].transcript.toLowerCase().trim()

      console.log('🗣️ Escuchado:', text)
      setTranscript(text)

      // Llamar al callback si existe
      if (onCommand) {
        onCommand(text)
      }
    }

    recognition.onerror = (event) => {
      console.error('Error de reconocimiento:', event.error)

      let mensaje = 'Error al reconocer voz'
      switch (event.error) {
        case 'no-speech':
          mensaje = 'No se detectó ninguna voz'
          break
        case 'audio-capture':
          mensaje = 'No se detectó micrófono'
          break
        case 'not-allowed':
          mensaje = 'Permiso de micrófono denegado'
          break
        default:
          mensaje = `Error: ${event.error}`
      }

      setError(mensaje)
      setIsListening(false)
    }

    recognitionRef.current = recognition

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [onCommand, options.lang, options.continuous, options.interimResults])

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      try {
        recognitionRef.current.start()
      } catch (e) {
        console.error('Error al iniciar reconocimiento:', e)
      }
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop()
    }
  }

  const toggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    toggleListening
  }
}

// Función helper para text-to-speech
export function hablar(text, options = {}) {
  if (!('speechSynthesis' in window)) {
    console.warn('Text-to-Speech no soportado')
    return
  }

  // Cancelar cualquier speech en progreso
  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = options.lang || 'es-EC'
  utterance.rate = options.rate || 0.9 // Más lento para adultos mayores
  utterance.pitch = options.pitch || 1
  utterance.volume = options.volume || 1

  window.speechSynthesis.speak(utterance)
}

export default useVoiceCommands
