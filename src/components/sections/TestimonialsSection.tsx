
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const testimonials = [
  {
    quote: "DigitalMigratePro saved me days of work. I migrated 67 products from Gumroad to Payhip in just minutes!",
    author: "Sarah Johnson",
    role: "Digital Product Creator",
    avatar: "/lovable-uploads/d7df8f5a-8395-447b-838f-d7e59b2ca3ff.png"
  },
  {
    quote: "The AI rewriting feature is a game-changer. My product descriptions are now better than the originals.",
    author: "Mark Williams",
    role: "Course Creator",
    avatar: "/lovable-uploads/a03edee2-6568-436e-974d-3d544d149b85.png"
  },
  {
    quote: "Zero stress, zero data loss. Everything transferred perfectly, including all my images and files.",
    author: "Jessica Chen",
    role: "UX/UI Designer",
    avatar: "/lovable-uploads/6326653b-23d5-431a-a677-b7895e49945c.png"
  }
];

const TestimonialsSection = () => {
  return (
    <section id="testimonials" className="py-16 sm:py-24 bg-white">
      <div className="section-container">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Loved by <span className="text-coral">Creators</span>
          </h2>
          <p className="text-lg text-coolGray">
            Don't just take our word for it. Here's what our customers have to say.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-offwhite rounded-xl p-6 shadow-md border border-gray-100 card-hover"
            >
              <div className="flex items-center mb-6">
                <Avatar className="h-12 w-12 mr-4">
                  <AvatarImage src={testimonial.avatar} alt={testimonial.author} />
                  <AvatarFallback>{testimonial.author.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-semibold">{testimonial.author}</h4>
                  <p className="text-sm text-coolGray">{testimonial.role}</p>
                </div>
              </div>
              <p className="text-coolGray">"{testimonial.quote}"</p>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <div className="inline-block bg-mint/10 text-mint px-6 py-3 rounded-lg">
            <span className="font-semibold">4.9/5</span> average rating from <span className="font-semibold">100+</span> creators
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
