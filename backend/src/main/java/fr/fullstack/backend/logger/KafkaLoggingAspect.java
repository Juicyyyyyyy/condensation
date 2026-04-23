package fr.fullstack.backend.logger;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.AfterReturning;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.reflect.MethodSignature;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Component;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;

@Aspect @Component
public class KafkaLoggingAspect {

    private final KafkaTemplate<String, Object> kafkaTemplate;
    private final ObjectMapper kafkaObjectMapper;

    public KafkaLoggingAspect(KafkaTemplate<String, Object> kafkaTemplate) {
        this.kafkaTemplate = kafkaTemplate;
        this.kafkaObjectMapper = new ObjectMapper();

        this.kafkaObjectMapper.registerModule(new com.fasterxml.jackson.datatype.jsr310.JavaTimeModule());
        this.kafkaObjectMapper.disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);

        this.kafkaObjectMapper.disable(SerializationFeature.FAIL_ON_EMPTY_BEANS);

        this.kafkaObjectMapper.addMixIn(Object.class, CycleSafeMixin.class);
    }

    @AfterReturning(
            pointcut = "execution(public * fr.fullstack.backend.service.*.*(..))",
            returning = "result"
    )
    public void logEveryServiceAction(JoinPoint joinPoint, Object result) {
        MethodSignature signature = (MethodSignature) joinPoint.getSignature();
        String className = signature.getDeclaringType().getSimpleName();
        String methodName = signature.getMethod().getName();

        Map<String, Object> logMessage = new HashMap<>();
        logMessage.put("timestamp", OffsetDateTime.now().toString());
        logMessage.put("action", className + "." + methodName);

        Object[] args = joinPoint.getArgs();
        String[] paramNames = signature.getParameterNames();
        Map<String, Object> methodParams = new HashMap<>();

        if (args != null && paramNames != null) {
            for (int i =0; i < args.length; i++) {
                Object arg = args[i];
                if (arg != null && !arg.getClass().getName().startsWith("org.springframework")) {
                    methodParams.put(paramNames[i], safeTransform(arg));
                }
            }
        }

        logMessage.put("parameters", methodParams);

        if (result != null) {
            logMessage.put("hasResult", true);
            logMessage.put("resultType", result.getClass().getSimpleName());
            logMessage.put("result", safeTransform(result));
        } else {
            logMessage.put("hasResult", false);
        }

        try {
            String jsonPayload = kafkaObjectMapper.writeValueAsString(logMessage);
            kafkaTemplate.send("catalog-logs", jsonPayload);
        } catch (Exception e) {
            Map<String, Object> fallback = new HashMap<>();
            fallback.put("timestamp", OffsetDateTime.now().toString());
            fallback.put("action", className + "." + methodName);
            fallback.put("serializationError", e.getMessage());
            kafkaTemplate.send("catalog-logs", fallback.toString());
        }
    }

    private Object safeTransform(Object value) {
        try {
            String json = kafkaObjectMapper.writeValueAsString(value);
            return kafkaObjectMapper.readValue(json, Object.class);
        } catch (Exception e) {
            return "Serialization Error: " + e.getMessage();
        }
    }

    @JsonIdentityInfo(generator = ObjectIdGenerators.IntSequenceGenerator.class, property = "@id")
    private abstract static class CycleSafeMixin {}
}
