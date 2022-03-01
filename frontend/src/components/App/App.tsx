import React from "react";

const App: React.VFC = React.memo(() => {
  return <div>hello world</div>;
});

App.displayName = "App";

export default App;
