"use client"

import { useEffect, useRef } from "react"
import { Link } from "react-router-dom"
import { GraduationCap, BookOpen, Users, Calendar, CheckCircle, ArrowRight } from "lucide-react"
import { useAuth } from "../Context/AuthContext"

export default function Landing() {
  const featuresRef = useRef(null)
  const { theme } = useAuth()

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible")
          }
        })
      },
      { threshold: 0.1 },
    )

    const elements = document.querySelectorAll(".scroll-animate")
    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  const features = [
    {
      icon: BookOpen,
      title: "Create Classes",
      description: "Teachers can create unlimited classes with unique codes for easy student enrollment.",
    },
    {
      icon: Calendar,
      title: "Assignment Management",
      description: "Create, schedule, and track assignments with due dates. View submission status at a glance.",
    },
    {
      icon: Users,
      title: "Student Collaboration",
      description: "Students can join classes, submit work, and engage with announcements through comments.",
    },
    {
      icon: CheckCircle,
      title: "Progress Tracking",
      description: "Track student submissions with detailed status: Submitted, Not Submitted, or Assigned.",
    },
  ]

  return (
    <div style={{ minHeight: "100vh", background: "var(--background)" }}>
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          background: theme === "dark" ? "rgba(15, 23, 42, 0.9)" : "rgba(255, 255, 255, 0.9)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid var(--border)",
          zIndex: 50,
          padding: "12px 0",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <GraduationCap size={22} color="white" />
            </div>
            <span style={{ fontSize: 20, fontWeight: 700, color: "var(--primary)" }}>Klassly</span>
          </div>

          <div style={{ display: "flex", gap: 12 }}>
            <Link to="/login" className="btn btn-ghost">
              Sign In
            </Link>
            <Link to="/signup" className="btn btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section
        style={{
          paddingTop: 140,
          paddingBottom: 80,
          textAlign: "center",
        }}
      >
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px" }}>
          <h1
            className="animate-slide-up"
            style={{
              fontSize: "clamp(36px, 6vw, 56px)",
              fontWeight: 800,
              lineHeight: 1.1,
              marginBottom: 24,
              background: "linear-gradient(135deg, var(--text-primary) 0%, var(--primary) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Modern Classroom Management Made Simple
          </h1>

          <p
            className="animate-slide-up"
            style={{
              fontSize: 18,
              color: "var(--text-secondary)",
              marginBottom: 40,
              maxWidth: 600,
              margin: "0 auto 40px",
              animationDelay: "0.1s",
            }}
          >
            Empower teachers and students with an intuitive platform for class management, assignments, and seamless
            communication.
          </p>

          <div
            className="animate-slide-up"
            style={{
              display: "flex",
              gap: 16,
              justifyContent: "center",
              animationDelay: "0.2s",
            }}
          >
            <Link to="/signup" className="btn btn-primary btn-lg">
              Start Free
              <ArrowRight size={18} />
            </Link>
            <a
              href="#features"
              className="btn btn-secondary btn-lg"
              onClick={(e) => {
                e.preventDefault()
                featuresRef.current?.scrollIntoView({ behavior: "smooth" })
              }}
            >
              Learn More
            </a>
          </div>
        </div>

        {/* Hero illustration */}
        <div
          className="animate-slide-up"
          style={{
            maxWidth: 1000,
            margin: "60px auto 0",
            padding: "0 24px",
            animationDelay: "0.3s",
          }}
        >
          <div
            style={{
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-lg)",
              boxShadow: "var(--shadow-lg)",
              padding: 24,
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 16,
            }}
          >
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  background: "var(--background)",
                  borderRadius: "var(--radius)",
                  padding: 16,
                  height: 120,
                }}
              >
                <div className="skeleton" style={{ width: "60%", height: 16, marginBottom: 12 }} />
                <div className="skeleton" style={{ width: "100%", height: 12, marginBottom: 8 }} />
                <div className="skeleton" style={{ width: "80%", height: 12 }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section
        ref={featuresRef}
        id="features"
        style={{
          padding: "80px 24px",
          maxWidth: 1200,
          margin: "0 auto",
        }}
      >
        <h2
          className="scroll-animate"
          style={{
            fontSize: 32,
            fontWeight: 700,
            textAlign: "center",
            marginBottom: 16,
            color: "var(--text-primary)",
          }}
        >
          Everything You Need
        </h2>
        <p
          className="scroll-animate"
          style={{
            fontSize: 16,
            color: "var(--text-secondary)",
            textAlign: "center",
            marginBottom: 48,
            maxWidth: 500,
            margin: "0 auto 48px",
          }}
        >
          A complete solution for managing your classroom efficiently
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 24,
          }}
        >
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="scroll-animate card"
              style={{
                padding: 24,
                transitionDelay: `${index * 0.1}s`,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: "rgba(79, 70, 229, 0.1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                }}
              >
                <feature.icon size={24} color="var(--primary)" />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 8, color: "var(--text-primary)" }}>
                {feature.title}
              </h3>
              <p style={{ fontSize: 14, color: "var(--text-secondary)", lineHeight: 1.6 }}>{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        style={{
          padding: "80px 24px",
          background: "linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%)",
        }}
      >
        <div style={{ maxWidth: 600, margin: "0 auto", textAlign: "center" }}>
          <h2
            className="scroll-animate"
            style={{
              fontSize: 32,
              fontWeight: 700,
              color: "white",
              marginBottom: 16,
            }}
          >
            Ready to Get Started?
          </h2>
          <p
            className="scroll-animate"
            style={{
              fontSize: 16,
              color: "rgba(255,255,255,0.8)",
              marginBottom: 32,
            }}
          >
            Join thousands of teachers and students using Klassly for better classroom management.
          </p>
          <Link
            to="/signup"
            className="btn btn-lg scroll-animate"
            style={{
              background: "white",
              color: "var(--primary)",
              padding: "14px 32px",
              fontSize: 16,
            }}
          >
            Create Free Account
            <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer
        style={{
          padding: "32px 24px",
          borderTop: "1px solid var(--border)",
          textAlign: "center",
          background: "var(--background)",
        }}
      >
        <p style={{ fontSize: 14, color: "var(--text-muted)" }}>
          &copy; {new Date().getFullYear()} Klassly. All rights reserved.
        </p>
      </footer>
    </div>
  )
}
