import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi } from "vitest"
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog"

describe("AlertDialog", () => {
  it("opens when trigger is clicked and closes on action", async () => {
    const handleAction = vi.fn()
    
    render(
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button>Open Dialog</button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleAction}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )

    // Initially dialog content is not in the DOM (radix default)
    expect(screen.queryByText(/Are you absolutely sure/i)).not.toBeInTheDocument()

    const trigger = screen.getByRole("button", { name: /open dialog/i })
    fireEvent.click(trigger)

    // Now it should be in the DOM
    expect(screen.getByText(/Are you absolutely sure/i)).toBeInTheDocument()

    const actionButton = screen.getByRole("button", { name: /continue/i })
    fireEvent.click(actionButton)

    expect(handleAction).toHaveBeenCalledTimes(1)

    // Content should eventually disappear
    await waitFor(() => {
      expect(screen.queryByText(/Are you absolutely sure/i)).not.toBeInTheDocument()
    })
  })

  it("closes on cancel", async () => {
    render(
      <AlertDialog>
        <AlertDialogTrigger>Open Dialog</AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )

    fireEvent.click(screen.getByText("Open Dialog"))
    expect(screen.getByText("Are you sure?")).toBeInTheDocument()

    fireEvent.click(screen.getByText("Cancel"))

    await waitFor(() => {
      expect(screen.queryByText("Are you sure?")).not.toBeInTheDocument()
    })
  })
})
