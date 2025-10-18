import { Icons } from "@/components/ui/icons"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Facebook, Instagram, Linkedin, Twitter, Mail, Phone, MapPin } from "lucide-react"
import { Link } from "react-router-dom"

function StackedCircularFooter() {
  return (
    <footer className="bg-background py-12 border-t">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col items-center">
          {/* Logo and Brand */}
          <div className="mb-8 rounded-full bg-primary/10 p-8">
            <Icons.logo className="icon-class w-8" />
          </div>
          
          {/* Company Description */}
          <div className="mb-8 text-center max-w-2xl">
            <h3 className="text-xl font-semibold text-foreground mb-3">Melhor Saúde</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              A plataforma líder em bem-estar corporativo em Moçambique. Conectamos empresas, colaboradores e especialistas em saúde para promover ambientes organizacionais mais fortes, humanos e produtivos.
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="mb-8 flex flex-wrap justify-center gap-6">
            <Link to="/" className="hover:text-primary transition-colors">Início</Link>
            <a href="#sobre-nos" className="hover:text-primary transition-colors">Sobre Nós</a>
            <Link to="/terms" className="hover:text-primary transition-colors">Termos</Link>
            <Link to="/support" className="hover:text-primary transition-colors">Suporte</Link>
            <Link to="/login" className="hover:text-primary transition-colors">Acesso</Link>
          </nav>

          {/* Contact Information */}
          <div className="mb-8 text-center">
            <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>contacto@melhorsaude.co.mz</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+258 21 123 456</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Maputo, Moçambique</span>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="mb-8 flex space-x-4">
            <Button variant="outline" size="icon" className="rounded-full" asChild>
              <a href="https://facebook.com/melhor.saude.mz" target="_blank" rel="noopener noreferrer">
                <Facebook className="h-4 w-4" />
                <span className="sr-only">Facebook</span>
              </a>
            </Button>
            <Button variant="outline" size="icon" className="rounded-full" asChild>
              <a href="https://twitter.com/melhorsaude_mz" target="_blank" rel="noopener noreferrer">
                <Twitter className="h-4 w-4" />
                <span className="sr-only">Twitter</span>
              </a>
            </Button>
            <Button variant="outline" size="icon" className="rounded-full" asChild>
              <a href="https://instagram.com/melhor.saude.mz" target="_blank" rel="noopener noreferrer">
                <Instagram className="h-4 w-4" />
                <span className="sr-only">Instagram</span>
              </a>
            </Button>
            <Button variant="outline" size="icon" className="rounded-full" asChild>
              <a href="https://linkedin.com/company/melhor-saude-mz" target="_blank" rel="noopener noreferrer">
                <Linkedin className="h-4 w-4" />
                <span className="sr-only">LinkedIn</span>
              </a>
            </Button>
          </div>

          {/* Newsletter Signup */}
          <div className="mb-8 w-full max-w-md">
            <div className="text-center mb-4">
              <h4 className="text-sm font-medium text-foreground mb-2">Subscreva à nossa newsletter</h4>
              <p className="text-xs text-muted-foreground">Receba as últimas atualizações sobre bem-estar corporativo</p>
            </div>
            <form className="flex space-x-2">
              <div className="flex-grow">
                <Label htmlFor="email" className="sr-only">Endereço de email</Label>
                <Input 
                  id="email" 
                  placeholder="O seu email" 
                  type="email" 
                  className="rounded-full" 
                  required 
                />
              </div>
              <Button type="submit" className="rounded-full">Subscrever</Button>
            </form>
          </div>

          {/* Copyright */}
          <div className="text-center border-t pt-8 w-full">
            <p className="text-sm text-muted-foreground">
              © 2024 Melhor Saúde. Todos os direitos reservados. | Plataforma de bem-estar corporativo
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

export { StackedCircularFooter }
