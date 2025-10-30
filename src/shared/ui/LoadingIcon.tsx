import { LoaderCircleIcon } from 'lucide-react';

const LoadingIcon = () => {
  return (
    <>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      <LoaderCircleIcon
        style={{
          animation: 'spin 1s linear infinite',
          transformOrigin: 'center',
        }}
        className="button-inline-icon"
      />
    </>
  );
};

export default LoadingIcon;
