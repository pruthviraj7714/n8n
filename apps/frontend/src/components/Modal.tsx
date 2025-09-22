interface IModal {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal = ({ isOpen, onClose, children }: IModal) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-card rounded-xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto border border-border">
        {children}
      </div>
    </div>
  );
};

export default Modal;
