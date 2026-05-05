type Props = {
    onClick: () => void,
    disabled: boolean,
    title: string,
}
export function DeltaButton({onClick, disabled, title, children}: React.PropsWithChildren<Props>) {
   return  <button 
            className="border opacity-50 hover:opacity-100 border-white/70 hover:border-white rounded cursor-pointer size-6"
            disabled={disabled}
            onClick={onClick}
            title={title}
        >
            {children}
        </button>
}
