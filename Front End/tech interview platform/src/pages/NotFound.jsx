/**
 * Not Found (404) Page
 * Handles invalid routes
 */

import { Link } from 'react-router-dom'
import './NotFound.css'

export default function NotFound() {
  return (
    <div className="notfound-container">
      <div className="notfound-content">
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you are looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn btn-primary">
          Go to Home
        </Link>
      </div>
    </div>
  )
}
