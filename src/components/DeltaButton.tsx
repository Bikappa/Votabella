type Props = {
    onClick: () => void,
    disabled: boolean,
}
export function DeltaButton({onClick, disabled, children}: React.PropsWithChildren<Props>) {
   return  <button 
            className="border opacity-50 hover:opacity-100 border-white/70 hover:border-white rounded cursor-pointer size-8"
            disabled={disabled}
            onClick={onClick}
        >
            {children}
        </button>
}