// app/page.tsx

export default function Page() {
  const values = [
    {
      title: "User-centric Problem Solving",
      text: `UX Design is mainstream at DeepThought. We research on different problem statements of users and indulge in iterative evolution of our products and services.`,
    },
    {
      title: "Re-discovering Ethics, Aesthetics",
      text: `DeepThought is continually in pursuit of new ways to look at the world around us. We strive towards discovering new principles of ethics and aesthetics.`,
    },
    {
      title: "Diversity and Inclusion",
      text: `DeepThought has a diverse group of individuals as employees, mentors and learners. Starting off from primary grade learners, we have expanded our base to include all life-long learners.`,
    },
    {
      title: "Consistent Evolution",
      text: `Be the ocean turbulent or calm, DeepThought believes in consistency. We set up our '20 Mile March', evolve our execution along the way, but our focus never deviates from the 20 miles.`,
    },
    {
      title: "Human Resource Development",
      text: `Deepthought believes in people who can speak the culture of the organization. We look for consistency and focus, humility and boldness - all the things that DeepThought embodies.`,
    },
    {
      title: "Intellectual Pedantry, Curiosity",
      text: `DeepThought encourages kids to remain kids, and adults to become kids once again. We encourage learners to dig the gold mines hidden in every discipline!`,
    },
    {
      title: "Rigor, Robustness and Research",
      text: `Unlearning and relearning is common in every DeepThought associate. We encourage everyone not to simply consume information, but to subject each assumption to reasoning.`,
    },
    {
      title: "Aspire for Creative Inductive Leaps",
      text: `We celebrate our Eureka Moments triumphantly. We believe our Zero-to-One innovation culture is indebted to the increased number of Eureka Moments we have been having!`,
    },
    {
      title: "Planet, People, and then Profits",
      text: `For DeepThought, there is no distinction between making profits and creating value for the society. We strive to create socio-economic value, through our business model.`,
    },
    {
      title: "Structured and Disruptive Thinking",
      text: `At DeepThought, we play with structures and chaos. We bring in various perspectives from diverse disciplines, and then converge the ideas to construct new ways of looking at things.`,
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50 text-gray-800 py-16 px-6 md:px-20">
      {/* Mission & Vision Section */}
      <section className="max-w-5xl mx-auto text-center mb-20">
        <h1 className="text-4xl font-bold mb-6">Our Mission and Vision</h1>
        <p className="text-lg italic leading-relaxed mb-6">
          {`DeepThought nurtures Thought Leaders who can extrapolate out of textual
          contents into (i) interdisciplinary (ii) cross-functional (iii) real-life
          problem solving that leads to socio-economic value creation.`}
        </p>
        <p className="text-lg italic leading-relaxed">
          {`To lead the world into a heaven of freedom where everyone is a
          researcher, where decision-making is thought through, where knowledge
          creators are respected.`}
        </p>
      </section>

      {/* Values & Principles Section */}
      <section className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          Values & Principles
        </h2>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {values.map((item, index) => (
            <div
              key={index}
              className="bg-white shadow-md rounded-xl p-6 hover:shadow-lg transition-shadow"
            >
              <h3 className="text-xl font-semibold mb-3">{item.title}</h3>
              <p className="text-sm leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
