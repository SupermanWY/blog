let tpl = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  <% data.forEach(item => {) %>
    <p>{%= item %}</p>
  <% }) %>
</body>
</html>`

function render(template) {
  // a = (/{%=(.+)%}/g).exec(template)
  // console.log(a)
  x = template.replace(/{%=(.+)%}/g, (...args) => {
    console.log(22, args)
    return `'${'${args[1]}'}'`
  })
  console.log(x)
}

render(tpl)