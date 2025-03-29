import React from "react"

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={`border-2 border-black rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-yellow ${className || ""}`}
      ref={ref}
      {...props}
    />
  )
})
Textarea.displayName = "Textarea"

export { Textarea }
