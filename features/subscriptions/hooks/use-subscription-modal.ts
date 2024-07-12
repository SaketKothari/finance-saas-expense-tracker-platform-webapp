import { create } from 'zustand';

type SubscriptionState = {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export const useSubscriptionModal = create<SubscriptionState>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));
