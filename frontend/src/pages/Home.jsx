function Home() {
  return (
    <div className="home-page">
      <header className="home-header">
        <h1>ContactHub</h1>
        <span>THE PERSONAL DIRECTORY</span>

        <nav>
          <a href="#about">About</a>
          <a href="#features">Features</a>
          <a href="/signin">Sign In</a>
        </nav>
      </header>

      <main className="home-content">
        <span className="eyebrow">WELCOME TO YOUR PERSONAL DIRECTORY</span>

        <h2>
          Every connection<br />
          has a story.
        </h2>

        <p>
          A beautiful and simple way to organize,
          manage and keep track of the people who matter.
        </p>

        <div className="home-actions">
          <a href="/signup">Create Your Account</a>
          <a href="/signin">I Already Have an Account</a>
        </div>
      </main>

      <section id="about">
        <h2>A little more organized.</h2>
        <p>
          ContactHub gives you one place to store,
          organize and manage your personal contacts.
        </p>
      </section>
    </div>
  )
}

export default Home