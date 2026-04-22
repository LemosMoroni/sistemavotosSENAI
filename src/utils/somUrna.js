export function tocarSomUrna() {
  try {
    const audio = new Audio('/confirma-urna.mp3');
    audio.play();
  } catch {
    // Silencia erros se o navegador bloquear o áudio
  }
}
