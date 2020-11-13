const UIContext = React.createContext(null)

function UIProvider({ children }) {

  const [showAlert, setShowAlert] = React.useState(false)

  const [alertText, setAlertText] =  React.useState('')

  const [alertTitle, setAlertTitle] =  React.useState('')

  function openAlert({title, text, alertType}) {
    setAlertTitle(title)
    setAlertText(text)
    setShowAlert(true) 
  }

  function closeAlert() {
    setAlertTitle('')
    setAlertText('')
    setShowAlert(false)
  }

  return (
    <UIContext.Provider value={{ openAlert, closeAlert, showAlert, alertTitle, alertText }}>
      {children}
    </UIContext.Provider>
  )  
}