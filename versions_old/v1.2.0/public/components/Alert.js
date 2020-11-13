function Alert(props) {
  return (
    <UIContext.Consumer>
      {({closeAlert, showAlert, alertTitle, alertText}) => showAlert ? (
        <div className="alert-back">
          <div className="alert-box">
            <div className="alert-header">{alertTitle}</div>
            <div className="alert-body">{alertText}</div>
            <div className="alert-footer">
              <button className="btn" onClick={() => closeAlert()}>Fechar</button>
            </div>
          </div>
        </div>
      ) : ''}
    </UIContext.Consumer>
  )  
}