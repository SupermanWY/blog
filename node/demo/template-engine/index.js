let tpl = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  <% arr.forEach(item => { %>
    <p>{%= item %}</p>
  <% }) %>

  <%if(Array.isArray(arr)){%>
    {%=arr%}
  <%}%>
</body>
</html>`

function render(template, data) {
  template = `
    with(data){
      let str = '';
      str += \`${template}\`;
      return str;
    }
  `
  console.log(template)

  template = template.replace(/{%=(.+)%}/g, (...args) => {
    return '${' + args[1] + '}'
  })


  template = template.replace(/<%(.+?)%>/g, (...args) => {
    return `\`;${args[1]}; str+=\``
  })


  const res = new Function('data', template)(data)
  return res;
}

render(tpl, {
  arr: [1, 2, 3]
})

