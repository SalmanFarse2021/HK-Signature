import React from 'react';

const NewsletterBox = () => {
  return (
    <section className="bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="mx-auto max-w-2xl text-center">
          {/* Details above */}
          <h2 className="text-2xl sm:text-3xl font-serif text-gray-900">Stay Connected with US!</h2>
          <p className="mt-2 text-sm text-gray-600">
            Sign up to get updates on new arrivals and offers.
          </p>

          {/* Email box below (centered, smaller) */}
          <form action="https://formsubmit.co/salmanfarse2021@gmail.com" method="POST" className="mt-5">
            <input type="hidden" name="_subject" value="New Newsletter Subscription for HK Signature" />
            <input type="hidden" name="_captcha" value="false" />

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <label htmlFor="newsletter-email" className="sr-only">Email address</label>
              <input
                id="newsletter-email"
                type="email"
                name="email"
                placeholder="you@example.com"
                className="w-full sm:w-72 rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-black/30"
                required
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-gray-900"
              >
                Subscribe
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default NewsletterBox;
