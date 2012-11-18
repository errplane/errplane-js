require 'bundler/setup'
require 'rake/minify'
require "#{File.dirname(__FILE__)}/version.rb"

Rake::Minify.new(:package) do
  dir("./") do
    group("pkg/errplane-min-#{VERSION}.js") do
      add("base64.js")
      add("errplane_api.js")
      add("errplane_metrics.js")
    end
  end
end
