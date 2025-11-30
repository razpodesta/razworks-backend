/**
 * @file Componente generador de Código QR.
 * @description Renderiza un código QR dinámicamente a partir de una URL. Esta versión
 *              ha sido refactorizada para aceptar colores personalizables.
 * @version 2.0
 * @author Raz Podestá
 */
import Image from 'next/image';

type QrCodeProps = {
  /** La URL a codificar en el QR. */
  url: string;
  /** El tamaño del QR en píxeles. */
  size?: number;
  /** El texto alternativo para la imagen del QR (importante para accesibilidad). */
  alt: string;
  /** El color de los módulos del QR en formato hexadecimal sin '#'. */
  color?: string;
  /** El color de fondo del QR en formato hexadecimal sin '#'. */
  bgColor?: string;
  className?: string;
};

/**
 * Muestra una imagen de código QR generada a partir de una URL.
 * @param {QrCodeProps} props - Las propiedades del componente.
 * @returns {JSX.Element} Un componente Image de Next.js que muestra el QR.
 */
export function QrCode({ url, size = 100, alt, color = '000000', bgColor = 'ffffff', className = '' }: QrCodeProps) {
  // Se construye la URL de la API, añadiendo los parámetros de color.
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}&color=${color}&bgcolor=${bgColor}&qzone=1`;

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <Image
        src={qrCodeUrl}
        alt={alt}
        fill
        sizes={`${size}px`}
        className="object-contain"
        unoptimized
      />
    </div>
  );
}
