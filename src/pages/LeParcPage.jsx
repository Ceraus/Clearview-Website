import { useEffect } from 'react'
import LeParcIntake, {
  LE_PARC_ADDRESS,
  LE_PARC_EMAIL,
  LE_PARC_PHONE,
  LE_PARC_PHONE_HREF,
  LE_PARC_SECTION_ID,
} from '../components/LeParcIntake'

const PAGE_TITLE = '287 Park Avenue South | Clearview Global'

function PinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 21s7-4.6 7-11a7 7 0 1 0-14 0c0 6.4 7 11 7 11z"
        stroke="#29b6ff"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.5" stroke="#29b6ff" strokeWidth="1.6" />
    </svg>
  )
}

export default function LeParcPage() {
  useEffect(() => {
    const previous = document.title
    document.title = PAGE_TITLE
    window.scrollTo(0, 0)
    return () => {
      document.title = previous
    }
  }, [])

  return (
    <main id="main-content" className="cl-page" tabIndex={-1}>
      <header className="cl-hero">
        <div className="cl-hero-inner">
          <div className="cl-intro">
            <p className="cl-kicker">United Charities Building · Le Parc</p>
            <p className="cl-hero-address">{LE_PARC_ADDRESS}</p>
            <h1 className="gradient-title cl-title">
              Welcome to Clearview Global!
            </h1>
            <p className="cl-lede">
              Looking for on-site tech help? You’re in the right place.
            </p>
            <a className="cl-form-jump" href={`#${LE_PARC_SECTION_ID}`}>
              Go to the inquiry form
            </a>
          </div>
        </div>
      </header>

      <div className="cl-workbench">
        <div className="cl-copy-col">
          <div className="cl-copy">
            <p>
              We’re your local IT and managed services team, based right here in the historic United Charities Building at 287 Park Avenue South. Since 2009, we’ve been helping Manhattan businesses keep their networks, workstations, and technology running seamlessly.
            </p>
            <p>
              Whether you’re occupying a suite at Le Parc, using a dedicated desk down the hall, or operating a neighboring business in the building, this quick form is designed specifically for on-site inquiries about how we can support your tech setup.
            </p>
            <p>
              Word of mouth keeps us growing: As our local community expands, so are we! If you know a friend or neighboring business in need of proactive, reliable IT support, we’d love an introduction.
            </p>
          </div>

        <section className="cl-facts" aria-labelledby="cl-facts-heading">
          <h2 id="cl-facts-heading" className="cl-facts-heading">
            This building
          </h2>
          <dl className="cl-spec">
            <div>
              <dt>Address</dt>
              <dd>
                <span className="cl-spec-icon">
                  <PinIcon />
                </span>
                {LE_PARC_ADDRESS}
                <span className="cl-spec-note">Also 105 East 22nd Street. ZIP 10010.</span>
              </dd>
            </div>
            <div>
              <dt>Landmark</dt>
              <dd>
                United Charities Building (United Charities Building Complex). U.S. National Historic Landmark, 17 July 1991. Listed on the National Register of Historic Places, 28 March 1985.
              </dd>
            </div>
            <div>
              <dt>Built</dt>
              <dd>
                1893, for the Charity Organization Society, commissioned by banker John Stewart Kennedy. Architect Robert H. Robertson. Additions in 1897 and 1915 by James Baker.
              </dd>
            </div>
            <div>
              <dt>Neighborhood</dt>
              <dd>
                Gramercy Park, Manhattan, near the Flatiron District — the northeast corner of Park Avenue South and East 22nd Street.
              </dd>
            </div>
            <div>
              <dt>Workspace operator</dt>
              <dd>
                Le Parc operates private offices, team suites, virtual offices, and conference rooms in this building. This page is Clearview’s IT intake, not a Le Parc lease application.
              </dd>
            </div>
            <div>
              <dt>Clearview</dt>
              <dd>
                Managed IT since 2009.{' '}
                <a href={LE_PARC_PHONE_HREF}>{LE_PARC_PHONE}</a>
                {' · '}
                <a href={`mailto:${LE_PARC_EMAIL}`}>{LE_PARC_EMAIL}</a>
              </dd>
            </div>
          </dl>
        </section>
        </div>

        <div className="cl-form-col">
          <LeParcIntake />
        </div>
      </div>
    </main>
  )
}
