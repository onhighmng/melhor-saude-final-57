import { Calendar, Settings, TrendingUp } from 'lucide-react';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { motion } from 'motion/react';

interface HomeProps {
  onNavigate?: (page: 'calendario' | 'desempenho') => void;
}

export function Home({ onNavigate }: HomeProps) {
  const upcomingSessions = [
    { id: 1, name: 'Sofia R.', time: 'Seg 08 - 14:30', avatar: 'SR' },
    { id: 2, name: 'Pedro M.', time: 'Ter 09 - 10:00', avatar: 'PM' },
    { id: 3, name: 'Luisa C.', time: 'Qua 10 - 16:00', avatar: 'LC' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="p-4 space-y-4"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      {/* Header */}
      <motion.div className="pt-4" variants={itemVariants}>
        <h1 className="text-3xl mb-1">Bem-vindo, Dr.</h1>
        <p className="text-gray-500 text-sm">Gerir as suas sessões e disponibilidade</p>
      </motion.div>

      {/* Calendar Card */}
      <motion.button 
        variants={itemVariants}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => onNavigate?.('calendario')}
        className="w-full bg-white rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow text-left"
      >
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center flex-shrink-0">
            <Calendar className="w-7 h-7 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="mb-1">Calendário</h3>
            <p className="text-sm text-gray-500">Gerir disponibilidade e horários</p>
          </div>
        </div>
      </motion.button>

      {/* Upcoming Sessions Card */}
      <motion.div className="bg-white rounded-3xl p-6 shadow-sm" variants={itemVariants}>
        <div className="mb-4">
          <h3 className="mb-1">Próximas Sessões</h3>
          <p className="text-sm text-gray-500">3 sessões agendadas</p>
        </div>

        <div className="space-y-3">
          {upcomingSessions.map((session) => (
            <div key={session.id} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                <span className="text-white text-sm">{session.avatar}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="truncate">{session.name}</div>
                <div className="text-sm text-gray-500">{session.time}</div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Configurações Card - Yellow/Cream */}
      <motion.div 
        className="bg-gradient-to-br from-yellow-50 to-amber-100 rounded-3xl p-6 shadow-sm" 
        variants={itemVariants}
      >
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
            <Settings className="w-7 h-7 text-amber-700" />
          </div>
          <div className="flex-1">
            <h3 className="mb-1">Configurações</h3>
            <p className="text-sm text-gray-700">Perfil e definições gerais</p>
          </div>
        </div>
      </motion.div>

      {/* Desempenho Card - Purple/Lavender with Image */}
      <motion.div 
        className="relative rounded-3xl overflow-hidden shadow-sm h-56" 
        variants={itemVariants}
      >
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtaW5pbWFsJTIwd29ya3NwYWNlfGVufDB8fHx8MTczMDkyNDgwMHww&ixlib=rb-4.1.0&q=80&w=1080"
          alt="Desempenho"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/80 to-purple-700/80" />
        
        <div className="absolute inset-0 p-6 flex flex-col justify-between">
          <div className="w-12 h-12 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-purple-600" />
          </div>
          
          <div>
            <h3 className="text-white mb-2">Desempenho</h3>
            <div className="space-y-1">
              <div className="flex items-baseline gap-2">
                <span className="text-white/80 text-sm">Sessões Concluídas</span>
                <span className="text-white text-xl">62</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-white/80 text-sm">Visualizações Atualizadas</span>
                <span className="text-white text-xl">5</span>
              </div>
            </div>
            <div className="mt-4">
              <div className="flex items-baseline gap-2">
                <span className="text-white/80 text-sm">Total Ganhos</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-white text-xl">49 950</span>
                <span className="text-white/80 text-sm">MZN</span>
              </div>
            </div>
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onNavigate?.('desempenho')}
              className="mt-4 w-full py-3 bg-white/90 backdrop-blur-sm rounded-full text-purple-700 hover:bg-white transition-colors"
            >
              Ver Completo
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}