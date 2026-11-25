import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "cn"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-[12px] border border-transparent bg-clip-padding text-sm font-semibold whitespace-nowrap transition-all outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/35 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default:
          "border-[1.5px] border-cozy-border-cocoa bg-cozy-sage text-cozy-espresso shadow-[inset_0_1.5px_0_rgba(255,253,247,0.65),0_3px_0_0_#6B534B,0_8px_16px_-6px_rgba(78,56,53,0.2)] hover:-translate-y-px hover:bg-[#84BC98] hover:shadow-[inset_0_1.5px_0_rgba(255,253,247,0.75),0_4px_0_0_#6B534B,0_10px_20px_-6px_rgba(78,56,53,0.22)] active:translate-y-[2px] active:shadow-[inset_0_1px_0_rgba(255,253,247,0.4),0_1px_0_0_#6B534B] disabled:translate-y-0 disabled:shadow-none",
        outline:
          "border-[1.5px] border-cozy-border-cocoa bg-card text-foreground shadow-[inset_0_1.5px_0_rgba(255,253,247,0.85),0_2.5px_0_0_#B69D8B,0_6px_12px_-6px_rgba(78,56,53,0.12)] hover:-translate-y-px hover:bg-cozy-cream hover:text-foreground active:translate-y-[1.5px] active:shadow-[0_1px_0_0_#7D635B] disabled:translate-y-0 disabled:shadow-none aria-expanded:bg-cozy-cream aria-expanded:text-foreground",
        secondary:
          "border-[1.5px] border-cozy-border-table/70 bg-secondary text-secondary-foreground shadow-[inset_0_1.5px_0_rgba(255,253,247,0.75),0_2.5px_0_0_#82AE94] hover:-translate-y-px hover:bg-cozy-sage/45 active:translate-y-[1.5px] active:shadow-[0_1px_0_0_#668C77] disabled:translate-y-0 disabled:shadow-none aria-expanded:bg-secondary aria-expanded:text-secondary-foreground",
        ghost:
          "hover:bg-cozy-cream/70 hover:text-foreground aria-expanded:bg-cozy-cream/70 aria-expanded:text-foreground",
        destructive:
          "border-[1.5px] border-destructive/45 bg-[#FBE8EA] text-destructive shadow-[inset_0_1.5px_0_rgba(255,253,247,0.75),0_2.5px_0_0_#CFA0A4] hover:-translate-y-px hover:bg-[#F5D8DC] active:translate-y-[1.5px] active:shadow-[0_1px_0_0_#9E686C] disabled:translate-y-0 disabled:shadow-none focus-visible:border-destructive/40 focus-visible:ring-destructive/20",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-8 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-6 gap-1 rounded-[min(var(--radius-md),10px)] px-2 text-xs in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3",
        sm: "h-7 gap-1 rounded-[min(var(--radius-md),12px)] px-2.5 text-[0.8rem] in-data-[slot=button-group]:rounded-lg has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-3.5",
        lg: "h-9 gap-1.5 px-2.5 has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-8",
        "icon-xs":
          "size-6 rounded-[min(var(--radius-md),10px)] in-data-[slot=button-group]:rounded-lg [&_svg:not([class*='size-'])]:size-3",
        "icon-sm":
          "size-7 rounded-[min(var(--radius-md),12px)] in-data-[slot=button-group]:rounded-lg",
        "icon-lg": "size-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
