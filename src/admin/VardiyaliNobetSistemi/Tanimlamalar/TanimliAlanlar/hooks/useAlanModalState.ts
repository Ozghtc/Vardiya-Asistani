import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../../../../contexts/AuthContext';
import { Alan, AlanModalState } from '../types/TanimliAlanlar.types';
import { getHomeRoute } from '../utils/alanHelpers';

export const useAlanModalState = (
  expandedAlan: number | null,
  setExpandedAlan: (id: number | null) => void,
  setSelectedAlan: (alan: Alan | null) => void,
  setIsDetayModalOpen: (isOpen: boolean) => void
): AlanModalState & {
  navigate: ReturnType<typeof useNavigate>;
  getHomeRouteForUser: () => string;
} => {
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const toggleExpand = (alanId: number) => {
    setExpandedAlan(expandedAlan === alanId ? null : alanId);
  };

  const openDetayModal = (alan: Alan) => {
    setSelectedAlan(alan);
    setIsDetayModalOpen(true);
  };

  const closeDetayModal = () => {
    setIsDetayModalOpen(false);
    setSelectedAlan(null);
  };

  const getHomeRouteForUser = (): string => {
    return getHomeRoute(user?.rol);
  };

  return {
    toggleExpand,
    openDetayModal,
    closeDetayModal,
    navigate,
    getHomeRouteForUser
  };
}; 