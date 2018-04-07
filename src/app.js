const React = require('react')
const ReactDOM = require('react-dom')

class App extends React.Component {
  render() {
    const {
      breadcrumbs,
      directory,
      items
    } = this.props;
    return (
      <div>
        <Breadcrumbs breadcrumbs={breadcrumbs} />
        <DirectoryContents directory={directory} contents={items}/>
      </div>
    )
  }
}

const Breadcrumbs = ({breadcrumbs}) => (
  <h3>
    {breadcrumbs.map((breadcrumb) => 
      <span key={breadcrumb.name}><a href={breadcrumb.path}>{breadcrumb.name}</a> /</span>
    )}
  </h3>
);

const DirectoryContents = ({directory, contents}) => (
  <table>
    <tbody>
      {contents.map((item) => 
        <tr key={item.name}>
          <td>{item.isDirectory ? 'D' : 'F' }</td>
          <td><a href={`/${directory}/${item.name}?view=true`}>{item.name}</a></td>
          <td><a href={`/${directory}/${item.name}?download=true`}>&#8595;</a></td>
        </tr>
      )}
    </tbody>
  </table>
);


ReactDOM.render(
  React.createElement(App, window.__APP_DATA__, null),
  document.getElementById('root')
);
