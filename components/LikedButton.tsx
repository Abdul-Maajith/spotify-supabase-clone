"use client";
import useAuthModal from '@/hooks/useAuthModal';
import { useUser } from '@/hooks/useUser';
import { useSessionContext } from '@supabase/auth-helpers-react';
import { Handlee } from 'next/font/google';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast';
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai';

interface LikedButtonProps {
    songId: string
}

const LikedButton: React.FC<LikedButtonProps> = ({
    songId
}) => {
  const router = useRouter();
  const { supabaseClient } = useSessionContext();
  const authModal = useAuthModal();
  const { user } = useUser();

  const [isLiked, setIsLiked] = useState<boolean>(false);

  useEffect(() => {
    if(!user?.id) {
        return;
    }

    const fetchData = async () => {
        const { data, error } = await supabaseClient
            .from("liked_songs")
            .select("*")
            .eq("user_id", user.id)
            .eq("song_id", songId)
            .single();
        
        if(!error && data) {
            setIsLiked(true);
        }
    }

    fetchData();
  }, [songId, supabaseClient, user?.id]);

  const Icon = isLiked ? AiFillHeart : AiOutlineHeart;

  const HandleLike = async () => {
    if(!user) {
        return authModal.onOpen();
    }
    
    // If it is already liked - remove
    if(isLiked) {
        const { error } = await supabaseClient
          .from("liked_songs")
          .delete()
          .eq("user_id", user.id)
          .eq("song_id", songId);

        if(error) {
            toast.error(error.message)
        } else {
            setIsLiked(false);
        }
    } else {
        const { error } = await supabaseClient
          .from("liked_songs")
          .insert({
            song_id: songId,
            user_id: user.id
          })
           
        if (error) {
          toast.error(error.message);
        } else {
          setIsLiked(true);
          toast.success("Liked!")
        }  
    }

    router.refresh();
  }

  return (
    <button className='opacity-75 transition' onClick={HandleLike}>
        <Icon color={isLiked ? "#22c55e" : "white"} size={25} />
    </button>
  )
}

export default LikedButton