"use client"
import Image from 'next/image';
import { ChangeEvent, useState } from 'react'
import semFoto from '../../../../../../public/foto1.png'
import { Camera, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { updateProfileAvatar } from '../_actions/update-avatar';
import { useSession } from 'next-auth/react'

interface AvatarProfileProps {
  avatarUrl: string | null;
  userId: string;
}

export function AvatarProfile({ avatarUrl, userId }: AvatarProfileProps) {
  const [previewImage, setPreviewImage] = useState(avatarUrl)
  const [loading, setLoading] = useState(false);

  const { update } = useSession();

  async function handleChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files[0]) {
      setLoading(true);
      const image = e.target.files[0];

      if (image.type !== 'image/jpeg' && image.type !== 'image/png' && image.type !== 'image/webp') {
        toast.error("Formato de imagem inválido. Use JPEG, PNG ou WEBP.");
        setLoading(false);
        return;
      }

      const newFilename = `${userId}`;
      const newFile = new File([image], newFilename, { type: image.type })

      const urlImage = await uploadImage(newFile)

      if (!urlImage || urlImage === "") {
        toast.error("Falha ao alterar imagem");
        setLoading(false);
        return;
      }

      setPreviewImage(urlImage);

      await updateProfileAvatar({ avatarUrl: urlImage })
      await update({ image: urlImage })
      setLoading(false);
    }
  }

  async function uploadImage(image: File): Promise<string | null> {
    try {
      toast("Estamos enviando sua imagem...")
      const formData = new FormData();
      formData.append("file", image)
      formData.append("userId", userId)

      const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/image/upload`, {
        method: "POST",
        body: formData
      })

      const data = await response.json();
      if (!response.ok) return null;

      toast("Imagem alterada com sucesso!")
      return data.secure_url as string
    } catch (err) {
      return null;
    }
  }

  return (
    /* O container pai unificado controla o formato redondo e tamanho do Avatar */
    <div className="relative group w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-2 border-border/80 bg-muted shadow-md transition-all hover:border-primary">
      
      {/* Imagem de Fundo ( preview ou semFoto ) */}
      <Image
        src={
          typeof previewImage === "string"
            ? previewImage
                .replace(/=s\d+-c/, "=s600-c") 
                .replace("/upload/", "/upload/w_500,h_500,c_fill,q_100/") 
            : semFoto
        }
        alt="Foto de perfil da clínica"
        fill
        sizes="(max-width: 768px) 160px, 192px" 
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        quality={100}
        priority
      />

      {/* Camada Interativa: Fica posicionada EXATAMENTE em cima da foto, centralizando o botão */}
      <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-opacity duration-200 z-10 text-white gap-1.5">
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <div className="p-2 bg-white/20 rounded-full backdrop-blur-xs">
              <Camera className="w-5 h-5" />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-wider">Alterar foto</span>
          </>
        )}
        <input
          type="file"
          accept="image/png, image/jpeg, image/webp"
          className="hidden" // Esconde o input nativo feio do navegador
          onChange={handleChange}
          disabled={loading}
        />
      </label>

      {/* Trava visual centralizada de Carregamento */}
      {loading && (
        <div className="absolute inset-0 bg-background/50 backdrop-blur-xs flex items-center justify-center z-20">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      )}
    </div>
  )
}
